<template>
  <el-card v-if="isEmpty">
    <Empty />
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
      v-for="card in words"
      :key="card.id + card.label"
      class="make-pair__card"
      :class="getCardClasses(card)"
      @click="onCardClicked(card)"
    >
      <el-card class="bg-orange">
        {{ card.label }}
      </el-card>
    </div>
  </div>
</template>

<script setup>
import * as Masonry from 'masonry-layout';
import { computed, nextTick, ref } from "vue";
import { useWordStore } from "../root";
import { wait } from "../utils";
import GameOver from '../components/GameOver.vue';
import Empty from '../components/Empty.vue';

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

const isPairInvalid = computed(() => {
  return ['isWord', 'isTranslation', 'isDescription'].some(key => selectedCards.value.every(card => card[key]));
});

const checkCardSelected = (card) => {
  return selectedCards.value.includes(card);
}

function getCardClasses(card) {
  return {
    'make-pair__card--selected': checkCardSelected(card),
    'make-pair__card--correct': isCorrect.value === true,
    'make-pair__card--wrong': isCorrect.value === false
  }
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

    const guess = selectedCards.value.find(card => card.type === 'guess') || selectedCards.value[0];
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

    &--selected {
      .el-card {
        top: -8px !important;
        left: -8px !important;
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
