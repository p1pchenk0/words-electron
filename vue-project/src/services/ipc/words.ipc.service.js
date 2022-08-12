export const makeWordService = (ipc) => {
  return {
    saveWord(wordData) {
      return new Promise((resolve, reject) => {
        ipc.once('word:save status', (_, result) => {
          if (result.success) {
            resolve(result);
          } else {
            reject(result);
          }
        });
        ipc.send('word:send', wordData);
      });
    },
    getWords(options) {
      return new Promise((resolve) => {
        ipc.once('word:list', (_, result) => resolve(result));
        ipc.send('word:get list', options);
      });
    },
    saveGameResults(words) {
      return new Promise((resolve) => {
        ipc.once('words: results saved', () => resolve());
        ipc.send('word: send results', words);
      });
    },
    getWordsCount() {
      return new Promise((resolve) => {
        ipc.once('words: sent count', (_, count) => {
          resolve(count);
        });
        ipc.send('words: count');
      });
    },
    deleteWordById(id) {
      return new Promise((resolve, reject) => {
        ipc.once('list: delete word result', (result) => {
          if (result.success) {
            resolve();
          } else {
            reject();
          }
        });
        ipc.send('list: delete word', id);
      });
    },
    updateWord(word) {
      return new Promise((resolve, reject) => {
        ipc.once('list: update word result', (_, result) => {
          if (result.success) {
            resolve(result);
          } else {
            reject(result);
          }
        });
        ipc.send('list: update word', word);
      });
    },
  }
}
