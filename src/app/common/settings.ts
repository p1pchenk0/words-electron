import { filter, pluck } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { ElectronService } from '../services/electron.service';
import { SEND_SETTINGS } from './events';

@Injectable()
export class Settings {
  public static settings: { hardMode: boolean } = { hardMode: false };

  constructor(private electronService: ElectronService) {
    electronService.electronEvents$.pipe(
      filter(o => o.event === SEND_SETTINGS),
      pluck('body')
    ).subscribe((settings: any) => {
      Settings.settings.hardMode = settings.hardMode;
    });
  }
}
