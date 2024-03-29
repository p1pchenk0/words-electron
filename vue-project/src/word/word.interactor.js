export const makeWordInteractor = ({ wordMapper, wordRepo, shuffle }) => {
  return {
    prepareGameWords({ words, mode, hardMode }) {
      const wordsCopy = shuffle(words.slice());
      const result = [];
      const amount = wordsCopy.length;

      for (let i = 0; i < amount; i++) {
        const currentWord = wordsCopy[i];

        if (mode === 'pair') {
          const answer = currentWord.getRandomVariant();

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
              isTranslation: currentWord.translations.includes(answer),
              isDescription: currentWord.description === answer,
            }
          ]);
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
            guessWord = currentWord.getRandomVariant({ translationsOnly: true });
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
              if (answerMode === 'translation') answer = el.getRandomVariant({ translationsOnly: true });

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
    },
    async increaseWordPriority({ word, words }) {
      const wordObject = words.find(w => w.id === word.id);

      wordObject.increaseWrongCount();

      return this.saveGameResults([wordObject]);
    },
    checkWordVariantChoice({ word, variant, words }) {
      const wordObject = words.find(w => w.id === word.id);

      return wordObject.tryAnswer(variant?.value);
    },
    async saveWord(wordPayload) {
      const formattedWord = wordMapper.toApiPayload(wordPayload);

      return wordRepo.saveWord(formattedWord);
    },
    async getWords(params) {
      const formattedParams = {
        wordsPerPage: params.itemsPerPage,
        page: params.page,
        order: params.order === 'ascending' ? 'asc' : 'desc',
        sortBy: params.prop,
        count: params.wordsPerGame,
        search: params.search,
        wrongCountPriority: params.wrongCountPriority
      };

      const [maybeError, words] = await wordRepo.getWords(formattedParams);

      if (maybeError) return [maybeError, []];

      return [null, words.map(wordMapper.toUI)];
    },
    async saveGameResults(words) {
      const formattedWords = words.map(wordMapper.toApiPayload);

      return wordRepo.saveGameResults(formattedWords);
    },
    async getWordsCount(params = {}) {
      const formattedParams = {
        search: params.search
      };

      return wordRepo.getWordsCount(formattedParams);
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
