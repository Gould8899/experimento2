import { Note } from 'tonal';

let audioContext: AudioContext | null = null;
let outputBus: {
  input: DynamicsCompressorNode;
  master: GainNode;
} | null = null;

type SynthVoice = {
  note: string;
  oscillator: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  mode: 'short' | 'sustain';
  sustained: boolean;
  released: boolean;
};

const activeVoices = new Set<SynthVoice>();
const sustainedVoices = new Map<string, SynthVoice>();

function getOutputBus(context: AudioContext) {
  if (!outputBus) {
    const compressor = context.createDynamicsCompressor();
    const master = context.createGain();

    compressor.threshold.setValueAtTime(-18, context.currentTime);
    compressor.knee.setValueAtTime(12, context.currentTime);
    compressor.ratio.setValueAtTime(3, context.currentTime);
    compressor.attack.setValueAtTime(0.003, context.currentTime);
    compressor.release.setValueAtTime(0.12, context.currentTime);
    master.gain.setValueAtTime(0.72, context.currentTime);

    compressor.connect(master);
    master.connect(context.destination);

    outputBus = { input: compressor, master };
  }

  return outputBus;
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function releaseVoice(voice: SynthVoice, releaseTime = 0.08) {
  const context = getAudioContext();
  if (!context || voice.released) return;

  voice.released = true;

  try {
    const now = context.currentTime;
    const gainParam = voice.gain.gain;
    const cancelAndHold = gainParam.cancelAndHoldAtTime;

    if (typeof cancelAndHold === 'function') {
      cancelAndHold.call(gainParam, now);
    } else {
      gainParam.cancelScheduledValues(now);
      gainParam.setValueAtTime(Math.max(gainParam.value, 0.0001), now);
    }

    gainParam.setTargetAtTime(0.0001, now, Math.max(releaseTime / 3, 0.015));
    voice.oscillator.stop(now + releaseTime + 0.08);
  } catch {
    // Ignore voices that are already stopping.
  }
}

function releaseMatchingVoices(
  predicate: (voice: SynthVoice) => boolean,
  releaseTime = 0.08,
) {
  for (const voice of [...activeVoices]) {
    if (!predicate(voice)) continue;

    if (sustainedVoices.get(voice.note) === voice) {
      sustainedVoices.delete(voice.note);
    }

    releaseVoice(voice, releaseTime);
  }
}

// Lightweight synth based on the Web Audio API for click feedback and note preview.
export function useSynth() {
  async function playNote(
    note: string,
    options?: {
      duration?: number;
      mode?: 'short' | 'sustain';
      replace?: boolean;
    },
  ) {
    const midi = Note.midi(note);
    const context = getAudioContext();
    const duration = options?.duration ?? 0.55;
    const mode = options?.mode ?? 'short';
    const replace = options?.replace ?? false;

    if (midi === null || !context) return;

    if (replace) {
      if (mode === 'short') {
        releaseMatchingVoices((voice) => voice.mode === 'short', 0.045);
      } else {
        stopNote(note, 0.04);
      }
    }

    if (mode === 'sustain' && sustainedVoices.has(note)) {
      return;
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    const now = context.currentTime;
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const { input } = getOutputBus(context);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.015);

    if (mode === 'short') {
      gain.gain.setTargetAtTime(
        0.0001,
        now + Math.max(duration - 0.08, 0.02),
        0.045,
      );
    }

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(input);

    const voice: SynthVoice = {
      note,
      oscillator,
      filter,
      gain,
      mode,
      sustained: mode === 'sustain',
      released: false,
    };

    activeVoices.add(voice);
    if (voice.sustained) {
      sustainedVoices.set(note, voice);
    }

    oscillator.addEventListener('ended', () => {
      activeVoices.delete(voice);
      if (sustainedVoices.get(note) === voice) {
        sustainedVoices.delete(note);
      }
      oscillator.disconnect();
      filter.disconnect();
      gain.disconnect();
    });

    oscillator.start(now);
    if (mode === 'short') {
      oscillator.stop(now + duration + 0.12);
    }
  }

  function stopNote(note: string, releaseTime = 0.08) {
    releaseMatchingVoices((voice) => voice.note === note, releaseTime);
  }

  function stopAll() {
    const voices = [...activeVoices];
    sustainedVoices.clear();

    for (const voice of voices) {
      releaseVoice(voice, 0.08);
    }
  }

  return { playNote, stopNote, stopAll };
}
