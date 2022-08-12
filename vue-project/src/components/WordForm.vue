<template>
  <el-row class="m-b-sm">
    <el-col :span="24">
      <el-input ref="wordInput" v-model="word" size="large" placeholder="Слово"/>
    </el-col>
  </el-row>
  <el-row class="m-b-sm" :gutter="16">
    <el-col :xs="24" :sm="12" :md="6" class="m-b-xs">
      <el-input v-model="translation" size="large" placeholder="Перевод"/>
    </el-col>
    <el-col :xs="24" :sm="12" :md="6" class="m-b-xs">
      <el-input v-model="translation2" size="large" placeholder="Перевод #2 (опционально)"/>
    </el-col>
    <el-col :xs="24" :sm="12" :md="6" class="m-b-xs">
      <el-input v-model="translation3" size="large" placeholder="Перевод #3 (опционально)"/>
    </el-col>
    <el-col :xs="24" :sm="12" :md="6" class="m-b-xs">
      <el-input v-model="translation4" size="large" placeholder="Перевод #4 (опционально)"/>
    </el-col>
  </el-row>
  <el-row class="m-b-md">
    <el-col :span="24">
      <el-input
        v-model="description"
        :rows="4"
        type="textarea"
        placeholder="Определение слова (убедитесь, что оно состоит из понятных Вам слов)"
      />
    </el-col>
  </el-row>
  <el-button
    :disabled="isDisabled"
    class="submit-btn"
    type="primary"
    size="large"
    @click="onFormSubmit"
  >
    Сохранить
  </el-button>
</template>

<script setup>
import { computed, ref, defineProps, watchEffect, onMounted } from 'vue';

const props = defineProps(['wordObject']);

const {
  word: passedWord,
  translations: [translationOne, translationTwo, translationThree, translationFour],
  description: passedDescription
} = props.wordObject || ({ word: '', description: '', translations: [] });

const wordInput = ref(null);
const word = ref(passedWord || '');
const translation = ref(translationOne || '');
const translation2 = ref(translationTwo || '');
const translation3 = ref(translationThree || '');
const translation4 = ref(translationFour || '');
const description = ref(passedDescription || '');

const formattedWord = computed(() => word.value.trim());
const formattedDescription = computed(() => description.value.trim());
const formattedTranslations = computed(() => [
  translation, translation2, translation3, translation4
].map(el => el.value.trim()).filter(Boolean));

const isDisabled = computed(() => {
  return [formattedWord, formattedTranslations].some(e => !e.value.length);
});

const emit = defineEmits(['wordSubmit']);

onMounted(() => {
  wordInput.value.focus();
});

watchEffect(() => {
  if (!props.wordObject) return;

  const {
    word: passedWord,
    translations: [translationOne, translationTwo, translationThree, translationFour],
    description: passedDescription
  } = props.wordObject;

  word.value = passedWord || '';
  translation.value = translationOne || '';
  translation2.value = translationTwo || '';
  translation3.value = translationThree || '';
  translation4.value = translationFour || '';
  description.value = passedDescription || '';
});

function onFormSubmit() {
  emit('wordSubmit', {
    word: formattedWord.value,
    translations: formattedTranslations.value,
    description: formattedDescription.value
  });
}

function resetForm() {
  [word, translation, translation2, translation3, translation4, description].forEach((el) => {
    el.value = '';
  });

  wordInput.value.focus();
}

defineExpose({ resetForm });
</script>

<style lang="scss">
.submit-btn {
  @media (max-width: 768px) {
    width: 100%;
  }
}
</style>
