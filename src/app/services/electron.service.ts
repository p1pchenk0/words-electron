import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import {
    DELETE_WORD_RESULT, GAME_RESULTS_SAVED, NEW_WORD_RESULT, SAVE_SETTINGS_RESULT, SEND_SETTINGS,
    SENT_WORDS_COUNT, UPDATE_WORD_RESULT, WORD_LIST
} from '../common/events';

@Injectable()
export class ElectronService {
    ipcRenderer: typeof ipcRenderer;
    private electronSubject: Subject<any> = new Subject<any>();
    public electronEvents$ = this.electronSubject.asObservable();

    constructor() {
        if (this.isElectron()) {
            this.ipcRenderer = window['require']('electron').ipcRenderer;

            this.listenToElectronEvents([
                WORD_LIST,
                GAME_RESULTS_SAVED,
                SAVE_SETTINGS_RESULT,
                SEND_SETTINGS,
                NEW_WORD_RESULT,
                DELETE_WORD_RESULT,
                UPDATE_WORD_RESULT,
                SENT_WORDS_COUNT
            ]);
        }
    }

    isElectron() {
        return window && window['process'] && window['process'].type;
    }

    listenToElectronEvents(list: string[]) {
        list.map((el) => {
            this.ipcRenderer.on(el, (event, result) => {
                this.electronSubject.next({
                    event: el,
                    body: result
                });
            });
        });
    }
}