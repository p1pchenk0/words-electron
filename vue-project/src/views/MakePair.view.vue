<template>
  <el-card v-if="isEmpty">
    <Empty/>
  </el-card>
  <GameOver
    v-else-if="isGameEnd"
    @startGame="startGame"
  />
  <div
    v-else
    ref="pairWrapper"
    class="make-pair__wrapper pointer"
  >
    <div class="make-pair__sizer"></div>
    <div
      v-for="card in formattedWords"
      :key="card.id + card.label"
      class="make-pair__card"
      :class="getCardClasses(card)"
      @click="onCardClicked(card)"
    >
      <el-card class="bg-orange">
        <div v-html="card.label" />
        <el-popover
          v-if="isCurrentCardSelected(card)"
          placement="top"
          :width="220"
          trigger="hover"
        >
          <template #reference>
            <el-button
              type="primary"
              :icon="Star"
              circle
              @click.stop="increaseWordPriority(card)"
            />
          </template>
          <template #default>
            Повысить приоритет, чтобы<br>
            слово встречалось чаще
          </template>
        </el-popover>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { Star } from "@element-plus/icons-vue";
import * as Masonry from 'masonry-layout';
import { computed, nextTick, ref } from "vue";
import { useWordStore } from "@/root";
import { wait } from "@/utils";
import GameOver from '../components/GameOver.vue';
import Empty from '../components/Empty.vue';
import { ElNotification } from "element-plus";
import { MESSAGES } from "@/constants";

// TODO: add an extra card "No right answer" for respective game mode

const pairWrapper = ref(null);
const store = useWordStore();
const masonry = ref(null);
const selectedCards = ref([]);
const words = ref([]);
const isCorrect = ref(null);

const isEmpty = computed(() => {
  return store.pairModeItems.length === 0;
});

const isGameEnd = computed(() => {
  return !words.value.length;
});

const isPairSelected = computed(() => {
  return selectedCards.value.length === 2;
});

const isOneCardSelected = computed(() => {
  return selectedCards.value.length === 1;
});

const isPairInvalid = computed(() => {
  const sameType = ['guess', 'answer'].some(type => selectedCards.value.every(card => card.type === type));

  return sameType || ['isWord', 'isTranslation', 'isDescription'].some(key => selectedCards.value.every(card => card[key]));
});

const formattedWords = computed(() => {
  return words.value.map(e => ({ ...e, label: e.label.replace('\n', '<div>—</div>') }));
});

const checkCardSelected = (card) => {
  return selectedCards.value.includes(card);
}

function isCurrentCardSelected(card) {
  return isOneCardSelected.value && selectedCards.value.includes(card);
}

function checkCardTransparency(card) {
  if (!isOneCardSelected.value || selectedCards.value.includes(card)) return false;

  const [{ type: selectedCardType }] = selectedCards.value;

  return card.type === selectedCardType;
}

function getCardClasses(card) {
  return {
    'make-pair__card--selected': checkCardSelected(card),
    'make-pair__card--transparent': checkCardTransparency(card),
    'make-pair__card--correct': isCorrect.value === true,
    'make-pair__card--wrong': isCorrect.value === false
  }
}

async function increaseWordPriority(card) {
  const maybeError = await store.increaseWordPriority(card);

  ElNotification({
    type: !maybeError ? 'success' : 'error',
    title: !maybeError ? MESSAGES.SUCCESS_TITLE : MESSAGES.ERROR_TITLE,
    message: !maybeError ? 'Приоритет слова повышен' : (maybeError.message || 'Что-то пошло не так')
  });
}

async function onCardClicked(card) {
  if (isPairSelected.value) return;

  if (selectedCards.value.includes(card)) {
    const cardIndex = selectedCards.value.findIndex(el => el === card);

    selectedCards.value.splice(cardIndex, 1);

    return;
  }

  selectedCards.value.push(card);

  if (isPairSelected.value) {
    if (isPairInvalid.value) {
      selectedCards.value = [];

      return;
    }

    const guess = selectedCards.value.find(card => card.type === 'guess');
    const answer = selectedCards.value.find(card => card.type === 'answer');

    isCorrect.value = store.checkAnswer({ currentWord: guess, variant: answer });

    await wait();

    selectedCards.value = [];

    if (isCorrect.value) {
      removeCardFromGame(guess.id);

      isCorrect.value = null;

      if (!words.value.length) {
        await store.saveGameResults();
      } else {
        await renderCards();
      }
    } else {
      isCorrect.value = null;
    }
  }
}

function removeCardFromGame(id) {
  words.value = words.value.filter(card => card.id !== id);
}

async function startGame() {
  masonry.value = null;

  await store.getWords();

  words.value = [...store.pairModeItems];

  if (isEmpty.value) return;

  await renderCards();
}

async function renderCards() {
  await nextTick();

  if (!masonry.value) {
    masonry.value = new (Masonry.default || Masonry)(pairWrapper.value, {
      itemSelector: '.make-pair__card',
      columnWidth: '.make-pair__sizer',
      percentPosition: true,
      gutter: 16
    })
  } else {
    masonry.value.layout();
  }
}

startGame();
</script>

<style lang="scss">
.make-pair {
  &__card, &__sizer {
    width: calc(25% - 12px);

    @media (max-width: 1024px) {
      width: calc(33% - 8px);
    }

    @media (max-width: 768px) {
      width: calc(50% - 8px);
    }
  }

  &__card {
    margin-bottom: 16px;

    .el-card {
      .el-button {
        position: absolute;
        top: -1px;
        right: -10px;
      }
    }

    &--transparent {
      .el-card {
        opacity: 0.5;
      }
    }

    &--selected {
      .el-card {
        top: -8px !important;
        left: -8px !important;
        overflow: visible;
      }
    }

    &--selected#{&}--correct {
      .el-card {
        background-color: green;
        color: white;
      }
    }

    &--selected#{&}--wrong {
      .el-card {
        background-color: #881919;
        color: white;
      }
    }

    .el-card {
      position: relative;
      top: 0;
      left: 0;
      color: black;
      transition: all .5s ease !important;
    }
  }
}
</style>
