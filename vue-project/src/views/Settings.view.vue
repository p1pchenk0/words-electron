<template>
  <el-card>
    <template #header>
      <div class="card-header">
        Изменение настроек
      </div>
    </template>

    <div class="m-b-md">
      <el-row align="middle">
        <el-col :span="6">
          Количество слов для игры
        </el-col>
        <el-col :span="18">
          <el-input-number v-model="wordsPerGame" :min="4"/>
        </el-col>
      </el-row>

      <div class="separator"></div>

      <el-row align="middle">
        <el-col :span="6">
          Количество слов на страницу при отображении всех слов
        </el-col>
        <el-col :span="18">
          <el-input-number v-model="wordsPerPage" :min="2" :max="10"/>
        </el-col>
      </el-row>

      <div class="separator"></div>

      <el-row align="middle">
        <el-col :span="24">
          <el-checkbox v-model="wrongCountPriority" size="large">
            <div class="flex align-center">
              Приоритет сложных слов
              <Tooltip>
                <template #text>
                  Слова, которые были неверно угаданы,
                  <br>
                  будут добавлены в следующую игру
                </template>
              </Tooltip>
            </div>
          </el-checkbox>
        </el-col>
      </el-row>

      <div class="separator"></div>

      <el-row align="middle">
        <el-col :span="24">
          <el-checkbox v-model="isHardMode" size="large">
            <div class="flex align-center">
              Усложненный режим игры 'Выбор варианта'
              <Tooltip>
                <template #text>
                  В этом режиме один из вариантов
                  <br>
                  будет заменен на вариант
                  <br>
                  "Нет правильного ответа"
                </template>
              </Tooltip>
            </div>
          </el-checkbox>
        </el-col>
      </el-row>
    </div>

    <el-button
      type="primary"
      size="large"
      :disabled="areSettingsValid"
      @click="saveSettings"
    >
      Сохранить
    </el-button>
  </el-card>
</template>

<script setup>
import { useSettingsStore } from "../root";
import { computed, onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { MESSAGES } from "../constants";
import Tooltip from "../components/Tooltip.vue";

const settingsStore = useSettingsStore();

const wordsPerPage = ref(2);
const wordsPerGame = ref(4);
const isHardMode = ref(false);
const wrongCountPriority = ref(false);

onMounted(() => {
  wordsPerGame.value = settingsStore.wordsPerGame;
  wordsPerPage.value = settingsStore.wordsPerPage;
  isHardMode.value = settingsStore.hardMode;
  wrongCountPriority.value = settingsStore.wrongCountPriority;
});

const areSettingsValid = computed(() => {
  return ![
    wordsPerPage.value,
    wordsPerGame.value
  ].every(Boolean);
});

async function saveSettings() {
  const newSettings = {
    wordsPerGame: wordsPerGame.value,
    wordsPerPage: wordsPerPage.value,
    hardMode: isHardMode.value,
    wrongCountPriority: wrongCountPriority.value
  };

  const maybeError = await settingsStore.saveSettings(newSettings);

  ElNotification({
    type: !maybeError ? 'success' : 'error',
    title: !maybeError ? MESSAGES.SUCCESS_TITLE : MESSAGES.ERROR_TITLE,
    message: !maybeError ? 'Настройки сохранены' : (maybeError.message || 'Настройки не сохранены')
  });
}
</script>

<style lang="scss">
.separator {
  width: 100%;
  height: 0;
  margin: 16px 0;
  border-top: 1px solid var(--el-border-color);
}
</style>
