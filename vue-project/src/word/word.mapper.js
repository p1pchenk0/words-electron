export const makeWordMapper = (makeWord) => ({
  toApiPayload(data) {
    const apiPayload = {};
    const { id, word, translations, description, rightWrongDiff } = data;

    apiPayload.word = word;
    apiPayload.translations = [...translations];
    apiPayload.rightWrongDiff = rightWrongDiff || 0;

    if (id) apiPayload._id = id;
    if (description) apiPayload.description = description;

    return apiPayload;
  },
  toUI(data) {
    return makeWord(data);
  },
});
