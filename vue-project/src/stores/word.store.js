import { defineStore } from 'pinia'

function prepareGameWords({ words, mode, shuffle, hardMode }) {
  const wordsCopy = shuffle(words.slice());
  const result = [];
  const amount = wordsCopy.length;

  for (let i = 0; i < amount; i++) {
    const currentWord = wordsCopy[i];

    if (mode === 'pair') {
      const guessTypes = ['word'];

      if (currentWord.description) guessTypes.push('description');

      const guessType = shuffle(guessTypes)[0];

      if (guessType === 'word') {
        const answer = shuffle(currentWord.translations.slice())[0];
        result.push(...[
          {
            id: currentWord.id,
            label: currentWord.word,
            value: currentWord.word,
            type: 'guess',
            isWord: true,
          },
          {
            id: currentWord.id,
            label: answer,
            value: answer,
            type: 'answer',
            isTranslation: true,
          }
        ])
      }

      if (guessType === 'description') {
        const answer = currentWord.word;
        result.push(...[
          {
            id: currentWord.id,
            label: currentWord.description,
            value: currentWord.description,
            type: 'guess',
            isDescription: true,
          },
          {
            id: currentWord.id,
            label: answer,
            value: answer,
            type: 'answer',
            isWord: true
          }
        ])
      }
    }

    if (mode === 'choose') {

      const otherWords = shuffle(words.slice().filter(el => el.word !== currentWord.word)).slice(0, 3);

      const modes = ['word', 'translation'];

      if (currentWord.description) modes.push('description');

      const guessMode = shuffle(modes)[0];

      let answerMode;
      let guessWord;

      if (guessMode === 'word') {
        guessWord = currentWord.word;
        answerMode = 'translation';
      }
      if (guessMode === 'translation') {
        guessWord = shuffle(currentWord.translations.slice())[0];
        answerMode = 'word';
      }
      if (guessMode === 'description') {
        guessWord = currentWord.description;
        answerMode = 'word';
      }

      const wordForGame = {
        id: currentWord.id,
        word: guessWord,
        isDescription: guessMode === 'description',
        variants: shuffle([currentWord, ...otherWords]).map(el => {
          let answer;

          if (answerMode === 'word') answer = el.word;
          if (answerMode === 'translation') answer = shuffle(el.translations.slice())[0];

          return { label: answer, value: answer, isCorrect: el === currentWord };
        })
      };

      if (Math.random() < .25 && hardMode) {
        shuffle(wordForGame.variants)[0].label = 'Нет правильного варианта';
        shuffle(wordForGame.variants);
      }

      result.push(wordForGame);
    }
  }

  return shuffle(result);
}

export const makeWordStore = ({ wordInteractor, shuffle, useSettingsStore }) => {
  return defineStore({
    id: 'word',
    state: () => ({
      words: [],
      totalWordsCount: 0
    }),
    getters: {
      chooseModeItems: (state) => {
        const settingsStore = useSettingsStore();

        return prepareGameWords({
          words: state.words,
          mode: 'choose',
          shuffle,
          hardMode: settingsStore.hardMode
        });
      },
      pairModeItems: (state) => {
        const settingsStore = useSettingsStore();

        return prepareGameWords({
          words: state.words,
          mode: 'pair',
          shuffle,
          hardMode: settingsStore.hardMode
        });
      }
    },
    actions: {
      checkAnswer({ currentWord, variant }) {
        const wordObject = this.words.find(w => w.id === currentWord.id);
        const possibleAnswer = variant?.value;

        const isCorrect = wordObject.translations.includes(possibleAnswer)
          || wordObject.word === possibleAnswer
          || wordObject.description === possibleAnswer

        if (isCorrect) {
          wordObject.rightWrongDiff++;
        } else {
          wordObject.rightWrongDiff--;
        }

        return isCorrect;
      },
      async saveWord(wordPayload) {
        return wordInteractor.saveWord(wordPayload);
      },
      async getWords(params = {}) {
        if (Object.keys(params).length) {
          const settings = useSettingsStore();

          params.itemsPerPage = settings.wordsPerPage;
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
