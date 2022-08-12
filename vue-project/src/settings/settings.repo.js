export const makeSettingsRepo = (api) => {
  return {
    async getSettings() {
      try {
        const settings = await api.getSettings();

        return [null, settings];
      } catch (err) {
        return [err, null];
      }
    },
    async saveSettings(payload) {
      try {
        await api.saveSettings(payload);

        return null;
      } catch (err) {
        return err;
      }
    }
  }
}
