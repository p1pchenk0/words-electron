import { makeWordStore } from "./stores/word.store";
import { makeWordInteractor } from "./word.interactor";
import { wordMapper } from "./word.mapper";
import { makeIpcService } from "./services/ipc.service";
import { makeWordRepo } from "./word.repo";
import { shuffle } from "./utils";
import { makeSettingsRepo } from "./settings.repo";
import { makeSettingsInteractor } from "./settings.interactor";
import { makeSettingsStore } from "./stores/settings.store";
import { settingsMapper } from "./settings.mapper";

const words = [
  {
    _id: 1,
    word: 'cat',
    translations: ['кот', 'кошка'],
    rightWrongDiff: -1,
    description: 'A small domesticated carnivorous mammal with soft fur, a short snout, and retractable claws. It is widely kept as a pet or for catching mice, and many breeds have been developed.'
  },
  {
    _id: 2,
    word: 'dog',
    translations: ['пес', 'собака'],
    rightWrongDiff: 1,
    description: 'A domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, non-retractable claws, and a barking, howling, or whining voice.'
  },
  {
    _id: 3,
    word: 'parrot',
    translations: ['попугай'],
    rightWrongDiff: 3,
    description: 'A bird, often vividly colored, with a short down-curved hooked bill, grasping feet, and a raucous voice, found especially in the tropics and feeding on fruits and seeds. Many are popular as cage birds, and some are able to mimic the human voice.'
  },
  {
    _id: 4,
    word: 'hamster',
    translations: ['хомяк'],
    rightWrongDiff: -2,
    description: 'A solitary burrowing rodent with a short tail and large cheek pouches for carrying food, native to Europe and northern Asia.'
  },
];

const settings = {
  wordsCount: 20,
  wordsPerPage: 5,
  hardMode: false,
  wrongCountPriority: false
}

const mockIPC = {
  async saveWord(wordData) {
    if (words.filter(w => w.word === wordData.word).length) {
      throw { success: false, message: 'Слово уже есть' };
    }

    words.push(wordData);

    return { success: true, message: 'Слово добавлено' };
  },
  async getWords(options) {
    let wordsCopy = words.slice();

    if (options.sortBy && options.order) {
      wordsCopy = wordsCopy.sort((a, b) => {
        if (options.order === 'asc') {
          return a[options.sortBy] > b[options.sortBy] ? 1 : -1;
        }

        if (options.order === 'desc') {
          return a[options.sortBy] > b[options.sortBy] ? -1 : 1;
        }
      });
    }

    if (options.page) {
      const offset = (options.page - 1) * options.wordsPerPage;
      wordsCopy = wordsCopy.slice(offset, offset + options.wordsPerPage);
    }

    return wordsCopy;
  },
  async saveGameResults(words) {
  },
  async getWordsCount() {
    return words.length;
  },
  async deleteWordById(id) {
    const deleteIdx = words.findIndex(w => w._id === id);

    words.splice(deleteIdx, 1);
  },
  async updateWord(payload) {
    const duplicate = words.find(word => word._id !== payload._id && word.word === payload.word);

    if (duplicate) {
      throw { success: false, message: 'Такое слово уже есть' };
    }

    const updateIndex = words.findIndex(word => word._id === payload._id);

    words.splice(updateIndex, 1, payload);

    return { success: true, message: 'Слово обновлено' };
  },
  async getSettings() {
    return settings;
  },
  async saveSettings(payload) {
    settings.wordsPerPage = payload.wordsPerPage;
    settings.wordsCount = payload.wordsCount;
    settings.hardMode = payload.hardMode;
    settings.wrongCountPriority = payload.wrongCountPriority;
  },
}

const isElectron = window.require && window.require('electron');

const ipcService = isElectron ? makeIpcService(window.require('electron').ipcRenderer) : mockIPC;

const wordRepo = makeWordRepo(ipcService);
const wordInteractor = makeWordInteractor({ wordMapper, wordRepo });

const settingsRepo = makeSettingsRepo(ipcService);
const settingsInteractor = makeSettingsInteractor({ settingsRepo, settingsMapper })

export const useSettingsStore = makeSettingsStore({ settingsInteractor });
export const useWordStore = makeWordStore({ wordInteractor, shuffle, useSettingsStore });
