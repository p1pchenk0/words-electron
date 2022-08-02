const Datastore = require("nedb");

module.exports = {
  _loadDatabase(db) {
    return new Promise((resolve) => {
      db.loadDatabase(resolve);
    });
  },

  prepareDb() {
    const _db = {};
    let wordsCount, wordsPerPage, wrongCountPriority;
    let defaultSettings = {
      id: "settings",
      wordsCount: 50,
      variantsCount: 4,
      wordsPerPage: 2,
      hardMode: false,
      wrongCountPriority: false
    };

    _db.words = new Datastore({
      filename: './words.db'
    });

    _db.settings = new Datastore({
      filename: './settings.db'
    });

    async function load() {
      await this._loadDatabase(_db.words);
      await this._loadDatabase(_db.settings);


    }

    return {

    }
  }
}
