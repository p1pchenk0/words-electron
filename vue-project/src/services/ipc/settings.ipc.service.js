export const makeSettingsService = (ipc) => {
  return {
    getSettings() {
      return new Promise((resolve) => {
        ipc.once('settings: sent', (_, settings) => resolve(settings))
        ipc.send('settings: get');
      });
    },
    saveSettings(payload) {
      return new Promise((resolve, reject) => {
        ipc.once('settings: save results', (_, result) => {
          if (result.success) {
            resolve(result);
          } else {
            reject(result);
          }
        });
        ipc.send('settings: save', payload);
      });
    }
  }
}
