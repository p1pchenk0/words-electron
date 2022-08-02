export const makeSettingsInteractor = ({ settingsMapper, settingsRepo }) => {
  return {
    async getSettings() {
      const [maybeError, settings] = await settingsRepo.getSettings();

      return [maybeError, settings ? settingsMapper.toUI(settings) : settings];
    },
    async saveSettings(payload) {
      const formattedPayload = settingsMapper.toApiPayload(payload);

      return settingsRepo.saveSettings(formattedPayload);
    }
  }
}
