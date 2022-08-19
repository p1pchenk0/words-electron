<template>
  <div class="navigation-wrapper p-b-sm p-t-sm p-l-sm p-r-sm bg-black">
    <div class="navigation-inner">
      <el-menu
        class="hidden-sm-and-down"
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
    </div>

    <el-dropdown class="hidden-md-and-up">
      <el-button type="primary" size="large">
        Меню
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(menuItem, index) in routes"
            @click="onSelect(index)"
          >
            {{ menuItem.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <div class="navigation-fx"></div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { PATH_NAMES } from "@/constants";
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

<style lang="scss">
.navigation {
  &-wrapper {
    position: fixed;
    z-index: 5;
    left: 0;
    right: 0;
    top: 0;
  }

  &-inner {
    max-width: 1280px;
    margin: 0 auto;
  }

  &-fx {
    @media (max-width: 991px) {
      height: 72px;
    }

    @media (min-width: 992px) {
      height: 91px;
    }
  }
}
</style>
