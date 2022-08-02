<template>
  <div class="empty-words text-center">
    <div class="m-b-sm">Вы пока что не добавили слов</div>
    <el-button type="primary" size="large" @click="goToAdd">Начать добавлять слова</el-button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { PATH_NAMES } from "../constants";

const router = useRouter();

function goToAdd() {
  router.push({ name: PATH_NAMES.ADD });
}
</script>

<style lang="scss">
.empty-words {
  line-height: 1 !important;
}
</style>
