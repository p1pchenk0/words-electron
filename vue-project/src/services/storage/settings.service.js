const defaultSettings = {
  id: "settings",
  wordsCount: 50,
  variantsCount: 4,
  wordsPerPage: 5,
  hardMode: false,
  wrongCountPriority: false
};

export const localSettingsService = {
  getSettings() {
    const settings = localStorage.getItem('settings');

    if (!settings) {
      localStorage.setItem('settings', JSON.stringify(defaultSettings));

      return { ...defaultSettings };
    }

    return JSON.parse(settings);
  },
  saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
  }
}
