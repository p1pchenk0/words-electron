const Datastore = require("nedb");
const { promisify, getRandomString } = require('./utils');

module.exports = {
  prepareDb() {
    let wordsCount, wordsPerPage, wrongCountPriority;
    let defaultSettings = {
      id: "settings",
      wordsCount: 50,
      variantsCount: 4,
      wordsPerPage: 5,
      hardMode: false,
      wrongCountPriority: false
    };

    const { wordsCollection, settingsCollection } = {
      wordsCollection: new Datastore({ filename: './words.db' }),
      settingsCollection: new Datastore({ filename: './settings.db' })
    };

    async function load() {
      await promisify(wordsCollection.loadDatabase.bind(wordsCollection));
      await promisify(settingsCollection.loadDatabase.bind(settingsCollection));

      const [, existingSettings] = await promisify(settingsCollection.findOne.bind(settingsCollection), { id: "settings" });

      if (!existingSettings) {
        const [, addedSettings] = await promisify(settingsCollection.insert.bind(settingsCollection), defaultSettings);

        wordsCount = addedSettings.wordsCount;
        wordsPerPage = addedSettings.wordsPerPage;
        wrongCountPriority = addedSettings.wrongCountPriority;
      } else {
        wordsCount = existingSettings.wordsCount;
        wordsPerPage = existingSettings.wordsPerPage;
        wrongCountPriority = existingSettings.wrongCountPriority;
      }
    }

    async function getSettings() {
      const [, settings] = await promisify(settingsCollection.findOne.bind(settingsCollection), { id: "settings" });

      return settings;
    }

    async function updateSettings(newSettings) {
      const [err, , updatedSettings] = await promisify(
        settingsCollection.update.bind(settingsCollection),
        { id: 'settings' },
        { ...newSettings, id: 'settings' },
        { returnUpdatedDocs: true }
      );

      if (err) return err;

      wordsCount = updatedSettings.wordsCount;
      wordsPerPage = updatedSettings.wordsPerPage;
      wrongCountPriority = updatedSettings.wrongCountPriority;

      return null;
    }

    async function getWords(options) {
      if (options && options.page) {
        const perPage = options.wordsPerPage || wordsPerPage;

        const findOptions = options.search ? { word: { $regex: new RegExp(options.search.trim().toLowerCase()) } } : {};

        let dataRequest = wordsCollection.find(findOptions);

        if (options.order && options.sortBy) {
          dataRequest = dataRequest.sort({ [options.sortBy]: options.order === 'asc' ? 1 : -1 });
        }

        dataRequest = dataRequest.skip(perPage * (options.page - 1)).limit(perPage);

        const [, words] = await promisify(dataRequest.exec.bind(dataRequest));

        return words;
      }

      const wordsAmount = options?.count || wordsCount;

      if (wrongCountPriority) {
        const dbRequest = wordsCollection.find({}).limit(wordsAmount).sort({ rightWrongDiff: 1 });

        const [, words] = await promisify(dbRequest.exec.bind(dbRequest));

        return words;
      }

      const [, count] = await promisify(wordsCollection.count.bind(wordsCollection), {});

      if (count <= wordsAmount) {
        const dbRequest = wordsCollection.find({}).limit(wordsAmount);

        const [, words] = await promisify(dbRequest.exec.bind(dbRequest));

        return words;
      }

      const words = [];

      while (words.length !== wordsAmount) {
        const randomIdPart = getRandomString(2);

        const [, found] = await promisify(wordsCollection.find.bind(wordsCollection), { _id: { $regex: new RegExp(randomIdPart) } });

        for (let word of found) {
          let index = words.findIndex(el => el._id === word._id);

          if (index === -1) words.push(word);
        }
      }

      return words;
    }

    async function getWordsCount(options = {}) {
      const findOptions = options.search ? { word: { $regex: new RegExp(options.search.trim().toLowerCase()) } } : {};
      const [, count] = await promisify(wordsCollection.count.bind(wordsCollection), findOptions);

      return count;
    }

    async function saveWord(payload) {
      const [, duplicate] = await promisify(wordsCollection.findOne.bind(wordsCollection), { word: payload.word });

      if (duplicate) {
        return {
          success: false,
          message: "Слово уже есть"
        }
      }

      const [err] = await promisify(wordsCollection.insert.bind(wordsCollection), payload);

      if (err) {
        return {
          success: false,
          message: err.message
        }
      }

      return {
        success: true,
        message: "Слово сохранено"
      }
    }

    async function saveGameResults(results) {
      await Promise.all(results.map((result) => {
        return promisify(
          wordsCollection.update.bind(wordsCollection),
          { word: result.word },
          { $set: { rightWrongDiff: result.rightWrongDiff } }
        );
      }))
    }

    async function updateWord(payload) {
      const [, duplicate] = await promisify(wordsCollection.findOne.bind(wordsCollection), {
        word: payload.word,
        _id: { $ne: payload._id }
      });

      if (duplicate) {
        return {
          success: false,
          message: 'Такое слово уже есть'
        };
      }

      const [err] = await promisify(wordsCollection.update.bind(wordsCollection), { _id: payload._id }, payload);

      if (err) {
        return {
          success: false,
          message: 'Слово не было обновлено'
        };
      }

      return {
        success: true,
        message: 'Слово было обновлено'
      };
    }

    async function deleteWordById(id) {
      const [err] = await promisify(wordsCollection.remove.bind(wordsCollection), { _id: id });

      if (err) {
        return {
          success: false,
          message: 'Слово не было удалено'
        };
      }

      return {
        success: true,
        message: 'Слово было удалено'
      };
    }

    return {
      load,
      getSettings,
      updateSettings,
      getWords,
      getWordsCount,
      saveWord,
      saveGameResults,
      updateWord,
      deleteWordById
    };
  }
}
