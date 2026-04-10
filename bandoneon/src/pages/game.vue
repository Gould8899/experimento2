<template>
  <div class="h-full overflow-hidden p-2 md:p-3">
    <div class="grid h-full min-h-0 gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <aside
        class="order-2 grid min-h-0 content-start gap-3 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm xl:order-1 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-800/80">
          <div
            class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            Training
          </div>
          <div class="mt-1 text-lg font-semibold tracking-tight">
            {{ currentPrompt }}
          </div>
          <div class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('difficulty') }}: {{ t('difficulty-' + difficulty) }}
          </div>
        </div>

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="mb-2 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            Manual
          </div>
          <NavVariant compact :readonly="currentPosition > 0" />
        </section>

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="mb-2 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            Note
          </div>
          <NavTonic compact />
        </section>

        <section
          v-if="difficulty !== 'easy'"
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="mb-2 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            Octave
          </div>
          <div class="flex flex-wrap gap-1.5">
            <Button
              v-for="octave in octaves"
              :key="octave"
              class="w-10 px-0 text-xs"
              :aria-pressed="octave === oct"
              :disabled="!tonic"
              @click.prevent="oct = octave"
            >
              {{ formatOctave(octave) }}
            </Button>
          </div>
        </section>

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="mb-2 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            Progress
          </div>
          <Progress
            :values="[
              { value: progress[2], color: '#22c55e' /* green-500 */ },
              { value: progress[1], color: '#eab308' /* yellow-500 */ },
              { value: progress[0], color: '#ef4444' /* red-500 */ },
            ]"
          />
        </section>

        <OtherPanel />
      </aside>

      <section
        class="order-1 flex min-h-0 flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm xl:order-2 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-100 px-4 py-3 dark:bg-neutral-800/80"
        >
          <div>
            <div
              class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
            >
              Current guess
            </div>
            <div class="text-sm font-semibold tracking-tight">
              {{ currentPrompt }}
            </div>
          </div>
          <div
            class="text-right text-xs text-neutral-500 dark:text-neutral-400"
          >
            <div>{{ t(side) }} · {{ formatMode(viewMode) }}</div>
            <div>{{ Math.round(progress[2] * 100) }}%</div>
          </div>
        </div>

        <div
          class="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100/80 px-2 py-3 dark:bg-neutral-800/40"
        >
          <SvgKeyboard :side="side" :mode="viewMode">
            <SvgButton
              v-for="([x, y, tonal], idx) in positions"
              :key="idx"
              :x="x"
              :y="y"
              :tonal="tonal"
              :label="label(idx)"
              :selected="idx === currentPosition"
              :color="fillColor(idx)"
              :label-rotation="labelRotation"
            />
          </SvgKeyboard>
        </div>
      </section>
    </div>
  </div>
  <Modal v-model="isModalOpen">
    <div class="px-4 py-8 text-center">
      <p class="mb-8">
        <strong>{{ correctPercentage }}%</strong>
        {{ t('correct') }}
      </p>
      <Button
        @click.prevent="
          isModalOpen = false;
          newGame();
        "
      >
        {{ t('try_again') }}
      </Button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import Button from '../components/Button.vue';
import Modal from '../components/Modal.vue';
import NavTonic from '../components/NavTonic.vue';
import NavVariant from '../components/NavVariant.vue';
import OtherPanel from '../components/OtherPanel.vue';
import Progress from '../components/Progress.vue';
import SvgButton from '../components/SvgButton.vue';
import SvgKeyboard from '../components/SvgKeyboard.vue';
import { useKeyboard } from '../composables/useKeyboard';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';

// Training mode: randomizes visible notes and scores the user's guesses.
useHead({ title: 'Play a game! – Bandoneon.app' });

useKeyboard();

const currentPosition = ref(0);
const guessed = ref<number[]>([]);
const oct = ref<number | null>(null);
const positions = ref<[number, number, string][]>([]);
const isModalOpen = ref(false);

const { t } = useI18n();

const store = useStore();
const { tonic, keyPositions, side } = storeToRefs(store);

const settings = useSettingsStore();
const { pitchNotation, difficulty, viewMode } = storeToRefs(settings);

const currentPrompt = computed(() => {
  if (currentPosition.value >= positions.value.length)
    return t('finished_round');
  return tonic.value ? tonic.value : t('guess_the_note');
});

const labelRotation = computed(() => {
  if (viewMode.value !== 'real') return 0;
  return side.value === 'left' ? 90 : -90;
});

const formatMode = (value: 'real' | 'flat') => {
  return value === 'real' ? t('view_real') : t('view_flat');
};

const formatOctave = (octave: number) => {
  if (pitchNotation.value !== 'helmholtz') {
    return '' + octave;
  }
  const noteName = tonic.value || 'X';
  return (
    (octave < 3 ? noteName : noteName.toLowerCase()) +
    (octave > 3 ? '’'.repeat(octave - 3) : '') +
    (octave < 2 ? ','.repeat(-(octave - 2)) : '')
  );
};

const fillColor = (idx: number) => {
  if (
    guessed.value[idx] === 2 ||
    (difficulty.value === 'easy' && guessed.value[idx] === 1)
  )
    return '#22c55e88'; // green-500
  if (guessed.value[idx] === 1) return '#eab30888'; // yellow-500
  if (guessed.value[idx] === 0) return '#ef444488'; // red-500
  return 'transparent';
};

const label = (idx: number) => {
  if (idx === currentPosition.value) return tonic.value || '?';
  if (typeof guessed.value[idx] === 'number') return;
  return '?';
};

const octaves = computed(() => {
  return [
    ...new Set(
      positions.value.map((position) => {
        const name = position[2];
        return name[name.length - 1];
      }),
    ),
  ]
    .map((item) => Number.parseInt(item, 10))
    .sort();
});

function shufflePositions<T>(items: T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function resetGame() {
  // Reset guesses
  currentPosition.value = 0;
  oct.value = null;
  guessed.value = [];
  store.setTonic(null);

  // Randomize position order
  positions.value = shufflePositions(keyPositions.value);
}

function newGame() {
  // Randomize side, direction
  store.$patch({
    side: Math.random() < 0.5 ? 'right' : 'left',
    direction: Math.random() < 0.5 ? 'open' : 'close',
  });

  resetGame();
}

onMounted(() => newGame());
watch(keyPositions, () => resetGame());

function check() {
  // Current guess is not complete
  if (positions.value.length <= currentPosition.value) return;

  // Current guess is complete
  const solution = positions.value[currentPosition.value][2];
  if (
    tonic.value !== null &&
    oct.value !== null &&
    tonic.value + oct.value === solution
  ) {
    guessed.value[currentPosition.value] = 2;
  } else if (tonic.value === solution.substring(0, solution.length - 1)) {
    guessed.value[currentPosition.value] = 1;
  } else {
    guessed.value[currentPosition.value] = 0;
  }

  // Proceed to next position
  currentPosition.value++;
  store.setTonic(null);
  oct.value = null;

  // Game is done
  if (currentPosition.value >= positions.value.length) {
    isModalOpen.value = true;
  }
}

watch([tonic, oct], () => {
  if (tonic.value && (difficulty.value === 'easy' || oct.value)) {
    check();
  }
});

const progress = computed(() => {
  if (positions.value.length === 0) return [0, 0, 0];

  const result = [0, 0, 0];

  for (const g of guessed.value) {
    if (g === 2 || (g === 1 && difficulty.value === 'easy')) result[2]++;
    else if (g === 1) result[1]++;
    else if (g === 0) result[0]++;
  }

  return result.map((value) => value / positions.value.length);
});

const correctPercentage = computed(() => Math.round(progress.value[2] * 100));

// Keyboard shortcuts for octave
function keydownListener({ key }: { key: string }) {
  if (!tonic.value) return;
  for (const octave of octaves.value) {
    if (key === '' + octave) oct.value = octave;
  }
}
onMounted(() => document.addEventListener('keydown', keydownListener));
onUnmounted(() => document.removeEventListener('keydown', keydownListener));
</script>
