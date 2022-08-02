<template>
  <el-row class="m-b-sm">
    <el-col :span="24">
      <el-input ref="wordInput" v-model="word" size="large" placeholder="Слово"/>
    </el-col>
  </el-row>
  <el-row class="m-b-sm" :gutter="16">
    <el-col :span="6">
      <el-input v-model="translation" size="large" placeholder="Перевод"/>
    </el-col>
    <el-col :span="6">
      <el-input v-model="translation2" size="large" placeholder="Перевод #2"/>
    </el-col>
    <el-col :span="6">
      <el-input v-model="translation3" size="large" placeholder="Перевод #3"/>
    </el-col>
    <el-col :span="6">
      <el-input v-model="translation4" size="large" placeholder="Перевод #4"/>
    </el-col>
  </el-row>
  <el-row class="m-b-md">
    <el-col :span="24">
      <el-input
        v-model="description"
        :rows="4"
        type="textarea"
        placeholder="Определение слова (убедитесь, что можете перевести само определение)"
      />
    </el-col>
  </el-row>
  <el-button
    :disabled="isDisabled"
    type="primary"
    size="large"
    @click="onFormSubmit"
  >
    Сохранить
  </el-button>
</template>

<script setup>
import { computed, ref, defineProps, watchEffect } from 'vue';

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
  if (!formattedWord.value.length) return true;

  return !formattedTranslations.value.length;
});

const emit = defineEmits(['wordSubmit']);

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
