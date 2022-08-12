export const settingsMapper = {
  toApiPayload(data) {
    const apiPayload = {};
    const { wordsPerGame, wordsPerPage, hardMode, wrongCountPriority } = data;

    apiPayload.wordsCount = wordsPerGame;
    apiPayload.wordsPerPage = wordsPerPage;
    apiPayload.hardMode = hardMode;
    apiPayload.wrongCountPriority = wrongCountPriority;

    return apiPayload;
  },
  toUI(data) {
    const uiData = {};
    const { wordsCount, wordsPerPage, hardMode, wrongCountPriority } = data;

    uiData.wordsPerGame = wordsCount;
    uiData.wordsPerPage = wordsPerPage;
    uiData.hardMode = hardMode;
    uiData.wrongCountPriority = wrongCountPriority;

    return uiData;
  }
}
