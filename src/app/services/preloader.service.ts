import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable()
export class PreloaderService {
    private preloaderSubject = new Subject<boolean>();

    showPreloader() {
        this.preloaderSubject.next(true);
    }

    hidePreloader() {
        this.preloaderSubject.next(false);
    }

    getPreloaderState() {
        return this.preloaderSubject.asObservable();
    }
}