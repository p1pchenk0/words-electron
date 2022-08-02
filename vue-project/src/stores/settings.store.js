import { defineStore } from "pinia";

export const makeSettingsStore = ({ settingsInteractor }) => {
  return defineStore({
    id: 'settings',
    state: () => ({
      wordsPerGame: 20,
      wordsPerPage: 5,
      hardMode: false,
      wrongCountPriority: false
    }),
    actions: {
      setSettings(payload) {
        const { wordsPerGame, wordsPerPage, hardMode, wrongCountPriority } = payload;

        this.wordsPerGame = wordsPerGame;
        this.wordsPerPage = wordsPerPage;
        this.hardMode = hardMode;
        this.wrongCountPriority = wrongCountPriority;
      },
      async getSettings() {
        const [maybeError, settings] = await settingsInteractor.getSettings();

        if (maybeError) return;

        this.setSettings(settings);
      },
      async saveSettings(payload) {
        const maybeError = await settingsInteractor.saveSettings(payload);

        if (maybeError) return maybeError;

        this.setSettings(payload);
      },
    }
  })
}
