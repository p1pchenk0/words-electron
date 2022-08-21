export const makeWordFactory = (shuffle) => (rawData) => {
  let { _id, word, translations, description, rightWrongDiff } = rawData;

  function tryAnswer(possibleAnswer) {
    const isCorrect = translations.includes(possibleAnswer) || [word, description].some(e => e === possibleAnswer);

    if (isCorrect) {
      rightWrongDiff++;
    } else {
      rightWrongDiff--;
    }

    return isCorrect;
  }

  function increaseWrongCount() {
    rightWrongDiff -= 10;
  }

  function getRandomVariant({ translationsOnly } = {}) {
    const answers = [...translations];

    if (description && !translationsOnly) answers.push(description);

    const [answer] = shuffle(answers);

    return answer;
  }

  return Object.freeze({
    get id() { return _id },
    get word() { return word },
    get translations() { return translations },
    get description() { return description || '' },
    get rightWrongDiff() { return rightWrongDiff || 0 },
    tryAnswer,
    increaseWrongCount,
    getRandomVariant
  });
};
