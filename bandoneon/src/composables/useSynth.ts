import { Note } from 'tonal';

let audioContext: AudioContext | null = null;
const activeOscillators = new Set<OscillatorNode>();

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

// Lightweight synth based on the Web Audio API for click feedback and note preview.
export function useSynth() {
  async function playNote(note: string, duration = 0.55) {
    const midi = Note.midi(note);
    const context = getAudioContext();

    if (midi === null || !context) return;

    if (context.state === 'suspended') {
      await context.resume();
    }

    const now = context.currentTime;
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    activeOscillators.add(oscillator);
    oscillator.addEventListener('ended', () => {
      activeOscillators.delete(oscillator);
      oscillator.disconnect();
      filter.disconnect();
      gain.disconnect();
    });

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function stopAll() {
    const oscillators = [...activeOscillators];
    activeOscillators.clear();

    for (const oscillator of oscillators) {
      try {
        oscillator.stop();
      } catch {
        // Ignore oscillators that are already stopping.
      }
    }
  }

  return { playNote, stopAll };
}
