const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron');
const Datastore = require('nedb');
const fs = require('fs');

const {
  SEND_NEW_WORD,
  NEW_WORD_RESULT,
  GET_WORDS_COUNT,
  SENT_WORDS_COUNT,
  GET_WORD_LIST,
  WORD_LIST,
  UPDATE_WORD,
  UPDATE_WORD_RESULT,
  DELETE_WORD,
  DELETE_WORD_RESULT,
  ASK_SETTINGS,
  SEND_SETTINGS,
  SAVE_SETTINGS,
  SAVE_SETTINGS_RESULT,
  SEND_GAME_RESULTS,
  GAME_RESULTS_SAVED
} = require('./events');
const Random = require('random-js');
const RNDM = new Random(Random.engines.mt19937().autoSeed());
let mainWindow;
let wordsCount, wordsPerPage; // will be taken from settings
let defaultSettings = {
  id: "settings",
  wordsCount: 50,
  variantsCount: 4,
  wordsPerPage: 2,
  hardMode: false
};
const db = {};

db.words = new Datastore({
  filename: './words.db'
});

db.settings = new Datastore({
  filename: './settings.db'
});

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function createMainWindow() {
  // uncomment for prod
  // Menu.setApplicationMenu(null);

  db.words.loadDatabase((err) => {
    db.settings.loadDatabase((err) => {
      db.settings.findOne({
        id: "settings"
      }, (err, found) => {
        if (!found) {
          db.settings.insert(defaultSettings, (err, added) => {
            wordsCount = added.wordsCount;
            wordsPerPage = added.wordsPerPage;
            loadWindow();
          });
        } else {
          wordsCount = found.wordsCount;
          wordsPerPage = found.wordsPerPage;
          loadWindow();
        }

      });

      function loadWindow() {
        mainWindow = new BrowserWindow({
          width: 900,
          height: 600,
          backgroundColor: '#fff',
          icon: `file://${__dirname}/dist/assets/logo.png`
        });

        mainWindow.loadURL(`file://${__dirname}/dist/words-electron/index.html`);

        mainWindow.on('closed', () => {
          mainWindow = null;
        });
      }
    });
  });
}

// Handler for saving new word
ipcMain.on(SEND_NEW_WORD, (event, newWord) => {
  db.words.findOne({
    english: newWord.english
  }, (err, found) => {
    if (found) {
      mainWindow.webContents.send(NEW_WORD_RESULT, {
        success: false,
        message: 'Такое слово уже есть'
      });
    } else {
      db.words.insert(newWord, (err, inserted) => {
        mainWindow.webContents.send(NEW_WORD_RESULT, {
          success: true,
          message: 'Слово добавлено'
        });
      });
    }
  });
});

// Handler for getting words
ipcMain.on(GET_WORD_LIST, (event, page) => {
  if (page) { // page is sent only from all words list tab
    db.words.find({}).skip(wordsPerPage * (page - 1)).limit(wordsPerPage).exec((err, words) => {
      mainWindow.webContents.send(WORD_LIST, words);
    });
  } else { // ask words for a game
    db.words.count({}, (err, count) => {
      if (count <= wordsCount) {
        // total words are less then words per game, so no reason to get random documents
        db.words.find({}).limit(wordsCount).exec((err, words) => {
          mainWindow.webContents.send(WORD_LIST, words);
        });
      } else {
        // "words per game" number is smaller than total amount of words, so get random documents
        getSomeRandomDocuments(wordsCount, (words) => {
          mainWindow.webContents.send(WORD_LIST, words);
        });
      }
    });
  }
});

// Handler for updating statistics
ipcMain.on(SEND_GAME_RESULTS, (event, results) => {
  let copiedResults = results.slice();
  (function updateResults() {
    let result = copiedResults.pop();
    db.words.update({
      english: result.english
    }, {
      $set: {
        rightCount: result.rightCount,
        wrongCount: result.wrongCount
      }
    }, {}, (err, res) => {
      if (copiedResults.length) {
        updateResults();
      } else {
        mainWindow.webContents.send(GAME_RESULTS_SAVED);
      }
    });
  })()
});

// Handler for getting settings
ipcMain.on(ASK_SETTINGS, (event, settings) => {
  db.settings.findOne({
    id: "settings"
  }, {
    _id: 0
  }, (err, found) => {
    mainWindow.webContents.send(SEND_SETTINGS, found);
  });
});

// Handler for saving settings
ipcMain.on(SAVE_SETTINGS, (events, settings) => {
  db.settings.update({
    id: "settings"
  }, { ...settings,
    id: "settings"
  }, {
    returnUpdatedDocs: true
  }, (err, res, saved) => {
    wordsCount = saved.wordsCount;
    wordsPerPage = saved.wordsPerPage;

    mainWindow.webContents.send(SAVE_SETTINGS_RESULT, {
      success: true,
      message: 'Настройки сохранены'
    });
  });
});

// Handler for updating word
ipcMain.on(UPDATE_WORD, (event, updatedWord) => {
  db.words.findOne({
    english: updatedWord.english,
    _id: {
      $ne: updatedWord._id
    }
  }, (err, match) => {
    if (match) {
      mainWindow.webContents.send(UPDATE_WORD_RESULT, {
        success: false,
        message: 'Такое слово уже есть'
      });
    } else {
      db.words.update({
        _id: updatedWord._id
      }, updatedWord, {
        returnUpdatedDocs: true
      }, (err, num, updated) => {
        if (err) {
          mainWindow.webContents.send(UPDATE_WORD_RESULT, {
            success: false,
            message: 'Слово не было обновлено'
          });
        } else {
          mainWindow.webContents.send(UPDATE_WORD_RESULT, {
            success: true,
            message: 'Слово было обновлено',
            word: updated
          });
        }
      });
    }
  });
});

// Handler for deleting words
ipcMain.on(DELETE_WORD, (event, deleteWord) => {
  db.words.remove({
    _id: deleteWord._id
  }, {}, (err, deleted) => {
    if (err) {
      mainWindow.webContents.send(DELETE_WORD_RESULT, {
        success: false,
        message: 'Слово не было удалено'
      });
    } else {
      mainWindow.webContents.send(DELETE_WORD_RESULT, {
        success: true,
        message: 'Слово было удалено'
      });
    }
  });
});

// Handler for counting words
ipcMain.on(GET_WORDS_COUNT, () => {
  db.words.count({}, (err, count) => {
    mainWindow.webContents.send(SENT_WORDS_COUNT, {
      count,
      wordsPerPage
    });
  });
});


function getSomeRandomDocuments(amount, cb) {
  let result = [];

  iterate();

  function iterate() {
    let str = getRandomString(2);

    db.words.find({
      _id: {
        $regex: new RegExp(str)
      }
    }, (err, foundDocs) => {
      if (foundDocs.length) {
        for (let doc of foundDocs) {
          let index = result.findIndex(el => el._id === doc._id);

          if (index === -1) result.push(doc);
        }

        if (result.length < amount) {
          iterate();
        } else {
          cb(result);
        }
      } else {
        iterate();
      }
    });
  }
}

function getRandomString(length) {
  let string = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    string += String(possible[RNDM.integer(0, possible.length - 1)]);
  }

  return string;
}
