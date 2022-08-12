const SETTINGS_DB = 'settings';
const VERSION = 1;
const defaultSettings = {
  id: "settings",
  wordsCount: 20,
  wordsPerPage: 10,
  hardMode: false,
  wrongCountPriority: false
};

export const makeSettingsIndexDbService = () => {
  const db = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

  return {
    async __openDb() {
      return new Promise((resolve, reject) => {
        const openRequest = db.open(SETTINGS_DB, VERSION);

        openRequest.onerror = (event) => {
          reject(event);
        };

        openRequest.onupgradeneeded = () => {
          const { result } = openRequest;

          result.createObjectStore(SETTINGS_DB, { keyPath: 'id' });
        }

        openRequest.onsuccess = () => {
          resolve(openRequest);
        }
      });
    },

    async getSettings() {
      const { result } = await this.__openDb();

      const transaction = result.transaction(SETTINGS_DB, 'readwrite');
      const store = transaction.objectStore(SETTINGS_DB);

      const settingsQuery = store.get('settings');

      return new Promise((resolve, reject) => {
        settingsQuery.onerror = (event) => {
          reject(event);
        }

        settingsQuery.onsuccess = () => {
          if (!settingsQuery.result) {
            store.put({ ...defaultSettings });

            resolve({ ...defaultSettings });
          } else {
            resolve(settingsQuery.result);
          }
        }

        transaction.oncomplete = () => result.close();
      });
    },

    async saveSettings(newSettings) {
      const { result } = await this.__openDb();

      const transaction = result.transaction(SETTINGS_DB, 'readwrite');
      const store = transaction.objectStore(SETTINGS_DB);

      const saveNewSettingsRequest = store.put({ id: 'settings', ...newSettings });

      return new Promise((resolve, reject) => {
        saveNewSettingsRequest.onerror = (event) => {
          reject(event);
        }

        saveNewSettingsRequest.onsuccess = () => {
          resolve();
        }

        transaction.oncomplete = () => result.close();
      });
    }
  }
}
