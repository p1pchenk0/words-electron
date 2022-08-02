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
let wordsCount, wordsPerPage, wrongCountPriority; // will be taken from settings
let defaultSettings = {
  id: "settings",
  wordsCount: 50,
  variantsCount: 4,
  wordsPerPage: 2,
  hardMode: false,
  wrongCountPriority: false
};
const db = {};

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

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
            wrongCountPriority = added.wrongCountPriority;
            loadWindow();
          });
        } else {
          wordsCount = found.wordsCount;
          wordsPerPage = found.wordsPerPage;
          wrongCountPriority = found.wrongCountPriority;
          loadWindow();
        }

      });

      function loadWindow() {
        mainWindow = new BrowserWindow({
          width: 1200,
          height: 800,
          backgroundColor: '#fff',
          icon: `file://${__dirname}/vue-project/dist/assets/logo.da9b9095.svg`,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          }
        });

        mainWindow.loadURL(`file://${__dirname}/vue-project/dist/index.html`);

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
    word: newWord.word
  }, (err, found) => {
    if (found) {
      mainWindow.webContents.send(NEW_WORD_RESULT, {
        success: false,
        message: 'Таке слово вже існує'
      });
    } else {
      db.words.insert(newWord, () => {
        mainWindow.webContents.send(NEW_WORD_RESULT, {
          success: true,
          message: 'Слово успішно збережено'
        });
      });
    }
  });
});

// Handler for getting words
ipcMain.on(GET_WORD_LIST, (event, options, search) => {
  if (options && options.page) { // page is sent only from all words list tab
    let dbRequest = search ? db.words.find({
      word: {
        $regex: new RegExp(search.toLowerCase())
      }
    }) : db.words.find({});
    let countRequest = search ? {
      word: {
        $regex: new RegExp(search.toLowerCase())
      }
    } : {};

    if (options.order && options.sortBy) {
      dbRequest = dbRequest.sort({ [options.sortBy]: options.order === 'asc' ? 1 : -1 });
    }

    db.words.count(countRequest, (err, count) => {
      const perPage = options.wordsPerPage || wordsPerPage;

      dbRequest.skip(perPage * (options.page - 1)).limit(perPage).exec((err, words) => {
        mainWindow.webContents.send(WORD_LIST, words, count);
      });
    });
  } else {
    const wordsAmount = options?.count || wordsCount;
    // ask words for a game
    if (wrongCountPriority) { // set mode for getting most wrongly used words
      db.words.find({}).limit(wordsAmount).sort({ rightWrongDiff: -1 }).exec((err, words) => {
        mainWindow.webContents.send(WORD_LIST, words);
      });
    } else {
      db.words.count({}, (err, count) => {
        if (count <= wordsAmount) {
          // total words are less then words per game, so no reason to get random documents
          db.words.find({}).limit(wordsAmount).exec((err, words) => {
            mainWindow.webContents.send(WORD_LIST, words);
          });
        } else {
          // "words per game" number is smaller than total amount of words, so get random documents
          getSomeRandomDocuments(wordsAmount, (words) => {
            mainWindow.webContents.send(WORD_LIST, words);
          });
        }
      });
    }
  }
});

// Handler for updating statistics
ipcMain.on(SEND_GAME_RESULTS, (event, results) => {
  let copiedResults = results.slice();
  (function updateResults() {
    let result = copiedResults.pop();
    db.words.update({
      word: result.word
    }, {
        $set: {
          rightWrongDiff: result.rightWrongDiff,
        }
      }, {}, () => {
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
  }, {
      ...settings,
      id: "settings"
    }, {
      returnUpdatedDocs: true
    }, (err, res, saved) => {
      wordsCount = saved.wordsCount;
      wordsPerPage = saved.wordsPerPage;
      wrongCountPriority = saved.wrongCountPriority;

      if (err) {
        mainWindow.webContents.send(SAVE_SETTINGS_RESULT, {
          success: false,
          message: err.message
        });

        return;
      }

      mainWindow.webContents.send(SAVE_SETTINGS_RESULT, {
        success: true,
        message: 'Настройки сохранены'
      });
    });
});

// Handler for updating word
ipcMain.on(UPDATE_WORD, (event, updatedWord) => {
  db.words.findOne({
    word: updatedWord.word,
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
ipcMain.on(DELETE_WORD, (event, id) => {
  db.words.remove({
    _id: id
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

function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) { }

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      application.quit();
      return true;
  }
};
