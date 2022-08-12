import { makeWordStore } from "./stores/word.store";
import { makeWordInteractor } from "./word/word.interactor";
import { wordMapper } from "./word/word.mapper";
import { makeWordRepo } from "./word/word.repo";
import { shuffle } from "./utils";
import { makeSettingsRepo } from "./settings/settings.repo";
import { makeSettingsInteractor } from "./settings/settings.interactor";
import { makeSettingsStore } from "./stores/settings.store";
import { settingsMapper } from "./settings/settings.mapper";
import { makeWordService } from "./services/ipc/words.ipc.service";
import { makeSettingsService } from "./services/ipc/settings.ipc.service";
import { localSettingsService } from "./services/storage/settings.service";
import { makeLocalWordsService } from "./services/storage/words.service";


const isElectron = window.require && window.require('electron');
const ipcRenderer = isElectron && window.require('electron').ipcRenderer;

// API layer
const wordService = isElectron ? makeWordService(ipcRenderer) : makeLocalWordsService();
const settingsService = isElectron ? makeSettingsService(ipcRenderer) : localSettingsService;

// Data Access layer
const wordRepo = makeWordRepo(wordService);
const settingsRepo = makeSettingsRepo(settingsService);

// Business logic layer
const wordInteractor = makeWordInteractor({ wordMapper, wordRepo, shuffle });
const settingsInteractor = makeSettingsInteractor({ settingsRepo, settingsMapper })

// App store layer
export const useSettingsStore = makeSettingsStore({ settingsInteractor });
export const useWordStore = makeWordStore({ wordInteractor, shuffle, useSettingsStore });
