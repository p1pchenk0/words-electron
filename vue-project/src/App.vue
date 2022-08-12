<script setup>
import { RouterView } from 'vue-router'
import Navigation from "./components/Navigation.vue";
import { useSettingsStore } from "./root";

const settingsStore = useSettingsStore();

settingsStore.getSettings();
</script>

<template>
  <Navigation />
  <RouterView />
</template>

<style scoped>
</style>
