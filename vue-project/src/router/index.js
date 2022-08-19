import { createRouter, createWebHashHistory } from 'vue-router'
import AddWordView from '../views/AddWord.view.vue';
import ChooseView from '../views/Choose.view.vue';
import MakePairView from '../views/MakePair.view.vue';
import WordListView from '../views/WordList.view.vue';
import SettingsView from '../views/Settings.view.vue';
import { PATH_NAMES } from "@/constants";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: PATH_NAMES.ADD
    },
    {
      path: '/add',
      name: PATH_NAMES.ADD,
      component: AddWordView
    },
    {
      path: '/choose',
      name: PATH_NAMES.CHOOSE,
      component: ChooseView
    },
    {
      path: '/make-pair',
      name: PATH_NAMES.MAKE_PAIR,
      component: MakePairView
    },
    {
      path: '/list',
      name: PATH_NAMES.LIST,
      component: WordListView
    },
    {
      path: '/settings',
      name: PATH_NAMES.SETTINGS,
      component: SettingsView
    }
  ]
})

export default router
