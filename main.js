const {
  app,
  BrowserWindow,
  ipcMain,
} = require('electron');
const Datastore = require('nedb');

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
const { prepareDb } = require("./db");

let mainWindow;

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function createMainWindow() {
  // uncomment for prod
  // Menu.setApplicationMenu(null);

  const dataAccess = prepareDb();

  await dataAccess.load();

  ipcMain.on(ASK_SETTINGS, async () => {
    const settings = await dataAccess.getSettings();

    mainWindow.webContents.send(SEND_SETTINGS, settings);
  });

  ipcMain.on(SAVE_SETTINGS, async (_, newSettings) => {
    const err = await dataAccess.updateSettings(newSettings);

    mainWindow.webContents.send(SAVE_SETTINGS_RESULT, { success: !err });
  });

  ipcMain.on(GET_WORD_LIST, async (event, options) => {
    const words = await dataAccess.getWords(options);

    mainWindow.webContents.send(WORD_LIST, words);
  });

  ipcMain.on(GET_WORDS_COUNT, async (event, options) => {
    const count = await dataAccess.getWordsCount(options);

    mainWindow.webContents.send(SENT_WORDS_COUNT, count);
  });

  ipcMain.on(SEND_NEW_WORD, async (event, newWord) => {
    const result = await dataAccess.saveWord(newWord);

    mainWindow.webContents.send(NEW_WORD_RESULT, result);
  });

  ipcMain.on(SEND_GAME_RESULTS, async (event, results) => {
    await dataAccess.saveGameResults(results);

    mainWindow.webContents.send(GAME_RESULTS_SAVED);
  });

  ipcMain.on(UPDATE_WORD, async (event, updatedWord) => {
    const result = await dataAccess.updateWord(updatedWord);

    mainWindow.webContents.send(UPDATE_WORD_RESULT, result);
  });

  ipcMain.on(DELETE_WORD, async (event, id) => {
    const result = await dataAccess.deleteWordById(id);

    mainWindow.webContents.send(DELETE_WORD_RESULT, result);
  });

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

  await mainWindow.loadURL(`file://${__dirname}/vue-project/dist/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
    } catch (error) {
    }

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
