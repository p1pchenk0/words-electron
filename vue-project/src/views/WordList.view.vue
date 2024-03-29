<template>
  <el-alert class="m-b-sm hidden-md-and-up" :closable="false">
    Таблица может не полностью помещаться на экране, есть возможность горизонтальной прокрутки
  </el-alert>

  <el-input
    :modelValue="search"
    @update:modelValue="onSearch"
    placeholder="Поиск слова"
    class="m-b-sm"
  />

  <el-table
    @sort-change="onSort"
    class-name="list-table m-b-sm"
    :default-sort="sortParams"
    :data="tableData"
    ref="table"
    style="width: 100%"
    stripe
    border
    table-layout="auto"
  >
    <template #empty>
      <div v-if="formattedSearch.length">По заданному запросу ничего не найдено</div>
      <Empty v-else style="margin: 20px"/>
    </template>
    <el-table-column prop="word" label="Слово" class-name="list-table__word" sortable="custom"/>
    <el-table-column prop="translations" label="Переводы" class-name="list-table__translations">
      <template #default="{ row, column, $index }">
        <div v-for="translation in row.translations" :key="translation">
          {{ translation }}
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="description" label="Описание" class-name="list-table__description"/>
    <el-table-column prop="rightWrongDiff" class-name="list-table__diff" sortable="custom">
      <template #header>
        Разница
        <Tooltip>
          <template #text>
            Разница между количеством правильных
            <br>
            и неправильных отгадываний
          </template>
        </Tooltip>
      </template>
    </el-table-column>
    <el-table-column prop="description" label="Действия" class-name="list-table__actions">
      <template #default="{ row }">
        <el-button size="large" type="primary" :icon="Edit" plain @click="openEditModal(row)"/>
        <el-button size="large" type="danger" :icon="Delete" plain @click="askDeleteConfirmation(row)"/>
      </template>
    </el-table-column>
  </el-table>
  <div class="justify-between">
    <el-pagination
      background
      hide-on-single-page
      layout="prev, pager, next"
      :page-size="settingsStore.wordsPerPage"
      :current-page="currentPage"
      :total="store.totalWordsCount"
      @update:current-page="onPageChange"
    />
    <el-alert
      class="words-count"
      :title="`Слов: ${store.totalWordsCount}`"
      :closable="false"
      type="info"
    />
  </div>


  <el-dialog
    v-model="isEditDialogOpen"
    title="Редактировать слово"
    width="50%"
  >
    <WordForm
      :word-object="wordBeingEdited"
      @wordSubmit="updateWord"
    />
  </el-dialog>
</template>

<script setup>
import { Edit, Delete } from '@element-plus/icons-vue';
import { ElMessageBox, ElNotification } from 'element-plus';
import { useSettingsStore, useWordStore } from "@/root";
import { computed, onMounted, ref, watch } from "vue";
import { MESSAGES } from "@/constants";
import Empty from "../components/Empty.vue";
import WordForm from "../components/WordForm.vue";
import Tooltip from "../components/Tooltip.vue";

const store = useWordStore();
const settingsStore = useSettingsStore();
const table = ref(null);
const sortParams = ref({ prop: 'word', order: 'ascending' });
const currentPage = ref(1);
const deleteCandidateId = ref(null);
const wordBeingEdited = ref(null);
const isEditDialogOpen = ref(false);
const search = ref('');

const tableData = computed(() => {
  return store.words;
});

function onSearch(input) {
  currentPage.value = 1;

  search.value = input;
}

const formattedSearch = computed(() => {
  return search.value.trim().toLowerCase();
});

function onPageChange(newPageNumber) {
  currentPage.value = newPageNumber;
}

function openEditModal(word) {
  wordBeingEdited.value = { ...word };
  isEditDialogOpen.value = true;
}

async function updateWord(word) {
  const wordToUpdate = { ...wordBeingEdited.value, ...word };

  const [maybeError, result] = await store.updateWord(wordToUpdate);

  ElNotification({
    type: !maybeError ? 'success' : 'error',
    title: !maybeError ? MESSAGES.SUCCESS_TITLE : MESSAGES.ERROR_TITLE,
    message: maybeError ? maybeError.message : result.message
  });

  if (maybeError) return;

  isEditDialogOpen.value = false;
  wordBeingEdited.value = null;
}

async function askDeleteConfirmation(row) {
  deleteCandidateId.value = row.id;

  try {
    const result = await ElMessageBox.alert('Вы уверены, что хотите удалить слово?', {
      showCancelButton: true,
      confirmButtonText: 'Да, удалить',
      cancelButtonText: 'Отмена'
    });

    if (result !== 'confirm') return;

    const maybeError = await store.deleteWordById(deleteCandidateId.value);

    ElNotification({
      type: !maybeError ? 'success' : 'error',
      title: !maybeError ? MESSAGES.SUCCESS_TITLE : MESSAGES.ERROR_TITLE,
      message: !maybeError ? 'Слово было удалено' : 'Слово не было удалено'
    });

    if (!maybeError) {
      if (tableData.value.length === 1) {
        currentPage.value--;
      }

      await store.getWordsCount();
      await store.getWords(params.value);
    }
  } catch (err) {
    deleteCandidateId.value = null;
  }
}

function onSort({ prop, order }) {
  if (!order) {
    sortParams.value = { ...sortParams.value };

    table.value.sort(sortParams.value);

    return;
  }

  currentPage.value = 1;

  sortParams.value = { ...sortParams.value, prop, order };
}

const params = computed(() => {
  return {
    ...sortParams.value,
    page: currentPage.value,
    search: formattedSearch.value,
  }
})

watch(params, () => {
  store.getWords(params.value);
});

onMounted(() => {
  store.getWords(params.value);
  store.getWordsCount();
});
</script>

<style lang="scss">
.list-table {
  &__word {
    min-width: 200px !important;
  }

  &__translations {
    min-width: 200px !important;
  }

  &__description {
    @media (max-width: 1024px) {
      min-width: 200px !important;
    }
  }

  &__actions {
    min-width: 150px !important;
  }

  &__diff {
    min-width: 130px !important;
  }

  th .cell {
    display: flex !important;
    align-items: center;
  }

  .cell {
    word-break: normal;
  }
}

.words-count {
  width: auto;
}
</style>
