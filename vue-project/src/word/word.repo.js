export const makeWordRepo = (api) => {
  return {
    async saveWord(payload) {
      try {
        const result = await api.saveWord(payload);

        return [null, result];
      } catch (err) {
        return [err, null];
      }
    },
    async getWords(options) {
      try {
        const words = await api.getWords(options);

        return [null, words];
      } catch (err) {
        return [err, null];
      }
    },
    async saveGameResults(words) {
      try {
        await api.saveGameResults(words);

        return null;
      } catch (err) {
        return err;
      }
    },
    async getWordsCount() {
      return api.getWordsCount();
    },
    async deleteWordById(id) {
      try {
        await api.deleteWordById(id);

        return null;
      } catch (err) {
        return err;
      }
    },
    async updateWord(payload) {
      try {
        const result = await api.updateWord(payload);

        return [null, result];
      } catch (err) {
        return [err, null];
      }
    },
  }
}
