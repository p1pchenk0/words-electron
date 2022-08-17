import { defineStore } from 'pinia'

export const makeWordStore = ({ wordInteractor, useSettingsStore }) => {
  return defineStore({
    id: 'word',
    state: () => ({
      words: [],
      totalWordsCount: 0
    }),
    getters: {
      chooseModeItems: (state) => {
        const settingsStore = useSettingsStore();

        return wordInteractor.prepareGameWords({
          words: state.words,
          mode: 'choose',
          hardMode: settingsStore.hardMode
        });
      },
      pairModeItems: (state) => {
        const settingsStore = useSettingsStore();

        return wordInteractor.prepareGameWords({
          words: state.words,
          mode: 'pair',
          hardMode: settingsStore.hardMode
        });
      }
    },
    actions: {
      checkAnswer({ currentWord, variant }) {
        return wordInteractor.checkWordVariantChoice({ words: this.words, word: currentWord, variant });
      },
      async increaseWordPriority(word) {
        return wordInteractor.increaseWordPriority({ word, words: this.words });
      },
      async saveWord(wordPayload) {
        return wordInteractor.saveWord(wordPayload);
      },
      async getWords(params = {}) {
        const settings = useSettingsStore();

        await settings.getSettings();

        if (Object.keys(params).length) {
          params.itemsPerPage = settings.wordsPerPage;
        } else {
          params.wrongCountPriority = settings.wrongCountPriority;
          params.wordsPerGame = settings.wordsPerGame;
        }

        const [maybeError, words] = await wordInteractor.getWords(params);

        if (maybeError) {
          this.words = [];

          return;
        }

        this.words = words;
      },
      async saveGameResults() {
        return wordInteractor.saveGameResults(this.words);
      },
      async getWordsCount() {
        this.totalWordsCount = await wordInteractor.getWordsCount();
      },
      async deleteWordById(id) {
        return wordInteractor.deleteWordById(id);
      },
      async updateWord(payload) {
        const [maybeError, result] = await wordInteractor.updateWord(payload);

        if (!maybeError) {
          const updateWordIndex = this.words.findIndex(word => word.id === payload.id);

          const wordsCopy = [...this.words];

          wordsCopy.splice(updateWordIndex, 1, payload);

          this.words = wordsCopy;
        }

        return [maybeError, result];
      },
    }
  })
}
