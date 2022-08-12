export const wordMapper = {
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
    const { _id, word, translations, description, rightWrongDiff } = data;

    return {
      id: _id,
      word,
      translations,
      description: description || '',
      rightWrongDiff: rightWrongDiff || 0
    }
  }
}
