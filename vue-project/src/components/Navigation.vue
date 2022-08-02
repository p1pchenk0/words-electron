<template>
  <el-menu
    :default-active="activeRouteIndex"
    mode="horizontal"
    @select="onSelect"
  >
    <el-menu-item
      v-for="(menuItem, index) in routes"
      :index="index.toString()"
    >
      {{ menuItem.label }}
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { PATH_NAMES } from "../constants";
import { computed, ref } from "vue";

const router = useRouter();
const route = useRoute();
const routes = ref([
  {
    label: 'Составление пары',
    route: PATH_NAMES.MAKE_PAIR
  },
  {
    label: 'Выбор варианта',
    route: PATH_NAMES.CHOOSE
  },
  {
    label: 'Добавить слово',
    route: PATH_NAMES.ADD
  },
  {
    label: 'Список слов',
    route: PATH_NAMES.LIST
  },
  {
    label: 'Настройки',
    route: PATH_NAMES.SETTINGS
  }
]);
const activeRouteIndex = computed(() => {
  return routes.value.findIndex(r => r.route === route.name).toString();
});

function onSelect(indexString) {
  const selectedRoute = routes.value[+indexString];

  router.push({ name: selectedRoute.route });
}
</script>

<style scoped>

</style>
