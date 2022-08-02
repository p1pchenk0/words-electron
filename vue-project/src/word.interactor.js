export const makeWordInteractor = ({ wordMapper, wordRepo }) => {
  return {
    async saveWord(wordPayload) {
      const formattedWord = wordMapper.toApiPayload(wordPayload);

      return wordRepo.saveWord(formattedWord);
    },
    async getWords(params) {
      const formattedParams = {
        wordsPerPage: params.itemsPerPage,
        page: params.page,
        order: params.order === 'ascending' ? 'asc' : 'desc',
        sortBy: params.prop
      };

      const [maybeError, words] = await wordRepo.getWords(formattedParams);

      if (maybeError) return [maybeError, []];

      return [null, words.map(wordMapper.toUI)];
    },
    async saveGameResults(words) {
      const formattedWords = words.map(wordMapper.toApiPayload);

      return wordRepo.saveGameResults(formattedWords);
    },
    async getWordsCount() {
      return wordRepo.getWordsCount();
    },
    async deleteWordById(id) {
      return wordRepo.deleteWordById(id);
    },
    async updateWord(wordPayload) {
      const formattedWord = wordMapper.toApiPayload(wordPayload);

      return wordRepo.updateWord(formattedWord);
    }
  }
}
