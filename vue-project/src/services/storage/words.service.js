function loadWordsFromStorage() {
  let words = localStorage.getItem('words');

  words = words ? JSON.parse(words) : [];

  return words;
}

function saveWordsToStorage(words) {
  localStorage.setItem('words', JSON.stringify(words));
}

export const makeLocalWordsService = () => ({
  saveWord(wordData) {
    const words = loadWordsFromStorage();

    if (words.filter(word => word.word === wordData.word).length) throw { success: false, message: "Слово уже есть" };

    wordData._id = Math.random().toString(36) + Math.random().toString(36);

    words.push(wordData);

    saveWordsToStorage(words);

    return { success: true, message: "Слово сохранено" };
  },
  getWords(options) {
    let words = loadWordsFromStorage().slice();

    if (options.order && options.sortBy) {
      const sign = options.order === 'asc' ? 1 : -1;

      words.sort((wordOne, wordTwo) => wordOne[options.sortBy] > wordTwo[options.sortBy] ? sign : sign * -1);
    }

    if (options.page) {
      const offset = (options.page - 1) * options.wordsPerPage;

      words = words.slice(offset, offset + options.wordsPerPage);
    }

    if (options.wrongCountPriority) words.sort((a, b) => a - b);

    if (options.count) words = words.slice(0, options.count);

    return words;
  },
  saveGameResults(updatedWords) {
    const words = loadWordsFromStorage().slice();

    updatedWords.forEach((word) => {
      const index = words.findIndex(w => w._id === word._id);

      words[index] = word;
    });

    saveWordsToStorage(words);
  },
  getWordsCount() {
    return loadWordsFromStorage().length;
  },
  deleteWordById(id) {
    const words = loadWordsFromStorage();
    const deleteIndex = words.indexOf(word => word._id === id);

    words.splice(deleteIndex, 1);

    saveWordsToStorage(words);

    return { success: true, message: 'Слово было удалено' };
  },
  updateWord(wordData) {
    const words = loadWordsFromStorage();
    const indexToUpdate = words.findIndex(word => word._id === wordData._id);
    const duplicate = words.find(word => word._id !== wordData._id && word.word === wordData.word);

    if (duplicate) throw { success: false, message: 'Такое слово уже есть' };

    words.splice(indexToUpdate, 1, wordData);

    saveWordsToStorage(words);

    return { success: true, message: 'Слово обновлено' };
  },
});
