// send to IPC
// export const ASK_PAGINATED_LIST = 'list: get paginated words';
export const SEND_NEW_WORD = 'word:send';
export const GET_WORD_LIST = 'word:get list';
export const GET_WORDS_COUNT = 'words: count';
export const SEND_GAME_RESULTS = 'word: send results';
export const ASK_SETTINGS = 'settings: get';
export const SAVE_SETTINGS = 'settings: save';
export const DELETE_WORD = 'list: delete word';
export const UPDATE_WORD = 'list: update word';

// get from IPC
export const NEW_WORD_RESULT = 'word:save status';
export const WORD_LIST = 'word:list';
export const GAME_RESULTS_SAVED = 'words: results saved';
export const SEND_SETTINGS = 'settings: sent';
export const SAVE_SETTINGS_RESULT = 'settings: save results';
export const DELETE_WORD_RESULT = 'list: delete word result';
export const UPDATE_WORD_RESULT = 'list: update word result';
export const SENT_WORDS_COUNT = 'words: sent count';
// export const SENT_PAGINATED_LIST = 'list: sent paginated words';