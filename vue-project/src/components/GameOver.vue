<template>
  <el-card class="text-center">
    <template #header>
      <h3>Игра окончена</h3>
      <span>Результаты сохранены</span>
    </template>
    <el-button
      @click="emit('startGame')"
      type="primary"
      size="large"
    >
      Сыграть еще раз
    </el-button>
  </el-card>
</template>

<script setup>
const emit = defineEmits(['startGame']);
</script>

<style scoped>

</style>
