<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        Добавить новое слово
      </div>
    </template>
    <WordForm
      ref="wordForm"
      @wordSubmit="onWordSubmit"
    />
  </el-card>
</template>

<script setup>
import WordForm from '../components/WordForm.vue';
import { useWordStore } from "../root";
import { ElNotification } from "element-plus";
import { ref } from 'vue';
import { MESSAGES } from "../constants";

const store = useWordStore();
const word = ref({ word: 'cat', translations: ['кот'] })
const wordForm = ref(null);

async function onWordSubmit(wordData) {
  const [maybeError, result] = await store.saveWord(wordData);

  if (maybeError) {
    return ElNotification({
      type: 'error',
      title: MESSAGES.ERROR_TITLE,
      message: maybeError.message
    });
  }

  ElNotification({
    type: result.success ? 'success' : 'error',
    title: result.success ? MESSAGES.SUCCESS_TITLE : MESSAGES.ERROR_TITLE,
    message: result.message
  })

  if (result.success) wordForm.value.resetForm();
}
</script>

<style scoped>
/*.box-card {*/
/*  max-width: 500px;*/
/*  margin: 0 auto;*/
/*}*/
</style>
