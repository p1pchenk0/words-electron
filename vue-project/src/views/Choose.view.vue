<template>
  <el-card v-if="isEmptyWords">
    <Empty />
  </el-card>
  <GameOver v-else-if="isGameEnd" @startGame="startGame"/>
  <template v-else>
    <el-row
      class="m-b-md choose__main-card"
      :class="{ 'choose__main-card--description': currentWord.isDescription }"
      justify="center"
    >
      <el-card class="text-center">
        <h3>
          {{ currentWord.word }}
        </h3>
      </el-card>
    </el-row>
    <template v-if="currentWord.variants.length">
      <el-row class="m-b-sm" :gutter="16">
        <el-col :span="12">
          <el-card
            ref="cardOne"
            :key="currentWord.id + currentWord.variants[0].label"
            @click="checkAnswer(0)"
            :style="{ minHeight: cardHeight + 'px' }"
            class="choose__guess-card text-center"
          >
            {{ currentWord.variants[0].label }}
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card
            ref="cardTwo"
            :key="currentWord.id + currentWord.variants[1].label"
            @click="checkAnswer(1)"
            :style="{ minHeight: cardHeight + 'px' }"
            class="text-center choose__guess-card"
          >
            {{ currentWord.variants[1].label }}
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-card
            ref="cardThree"
            :key="currentWord.id + currentWord.variants[2].label"
            @click="checkAnswer(2)"
            :style="{ minHeight: cardHeight + 'px' }"
            class="text-center choose__guess-card"
          >
            {{ currentWord.variants[2].label }}
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card
            ref="cardFour"
            :key="currentWord.id + currentWord.variants[3].label"
            @click="checkAnswer(3)"
            :style="{ minHeight: cardHeight + 'px' }"
            class="text-center choose__guess-card"
          >
            {{ currentWord.variants[3].label }}
          </el-card>
        </el-col>
      </el-row>
    </template>
  </template>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';
import { useWordStore } from "../root";
import { ElNotification } from "element-plus";
import GameOver from "../components/GameOver.vue";
import { MESSAGES } from "../constants";
import Empty from "../components/Empty.vue";

const store = useWordStore();
const currentRound = ref(0);
const cardHeight = ref(0);
const cardOne = ref(null);
const cardTwo = ref(null);
const cardThree = ref(null);
const cardFour = ref(null);

const currentWord = computed(() => {
  return store.chooseModeItems[currentRound.value] || { variants: [] };
});

const isEmptyWords = computed(() => {
  return currentRound.value === 0 && store.chooseModeItems.length === 0;
});

const isGameEnd = computed(() => {
  return currentRound.value === store.chooseModeItems.length;
});

async function checkAnswer(index) {
  const isCorrect = store.checkAnswer({ currentWord: currentWord.value, variant: currentWord.value.variants[index] });
  const correctAnswer = currentWord.value.variants.find(el => el.isCorrect).value;

  ElNotification({
    type: isCorrect ? 'success' : 'error',
    title: isCorrect ? MESSAGES.SUCCESS_TITLE : MESSAGES.ERROR_TITLE,
    message: isCorrect ? `Действительно, это ${correctAnswer}` : `Правильный ответ: ${correctAnswer}`,
    duration: isCorrect ? 2000 : 4000,
    showClose: !isCorrect
  });

  currentRound.value++;

  if (isGameEnd.value) {
    await store.saveGameResults();

    return;
  }

  await alignCardsHeight();
}

async function startGame() {
  currentRound.value = 0;

  await store.getWords();

  if (isEmptyWords.value) return;

  await alignCardsHeight();
}

async function alignCardsHeight() {
  await nextTick();
  cardHeight.value = 0;
  await nextTick();
  cardHeight.value = Math.max(...[cardOne, cardTwo, cardThree, cardFour].map(card => card.value.$el.clientHeight));
}

startGame();
</script>

<style lang="scss">
.choose {
  &__main-card {
    .el-card {
      min-width: 100%;
      text-transform: uppercase;
      letter-spacing: 5px;
    }

    &--description {
      .el-card {
        text-transform: none;
        letter-spacing: normal;
      }
    }
  }

  &__guess-card {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
  }
}
</style>
