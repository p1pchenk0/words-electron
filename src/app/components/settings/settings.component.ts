import { ipcRenderer } from 'electron';
import { filter, pluck, takeWhile } from 'rxjs/operators';

import { Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

import { AppComponent } from '../../app.component';
import {
  ASK_SETTINGS, SAVE_SETTINGS, SAVE_SETTINGS_RESULT, SEND_SETTINGS
} from '../../common/events';
import { SETTINGS_GAMESET_COUNT, SETTINGS_WORDS_PER_PAGE, SETTINGS_HARD_MODE } from '../../common/hints';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy {
  @ViewChild('form') myForm;
  wordsCountHint = SETTINGS_GAMESET_COUNT;
  perPageHint = SETTINGS_WORDS_PER_PAGE;
  hardModeHint = SETTINGS_HARD_MODE;
  settingsForm: FormGroup;
  isAlive: boolean = true;

  constructor(private electronService: ElectronService,
    private zone: NgZone,
    private formBuilder: FormBuilder,
    @Inject(AppComponent) private appComponent: AppComponent,
    private snackBar: MatSnackBar) {
    this.settingsForm = formBuilder.group({
      wordsCount: ['', Validators.compose([Validators.required, Validators.min(1)])],
      wordsPerPage: ['', Validators.compose([Validators.required, Validators.min(2)])],
      hardMode: false
    });
  }

  ngOnInit() {
    this.electronService.ipcRenderer.send(ASK_SETTINGS);

    this.electronService.electronEvents$.pipe(
      takeWhile(() => this.isAlive),
      filter(o => o.event === SEND_SETTINGS),
      pluck('body')
    ).subscribe((event) => {
      this.sendSettingsHandler(event);
    });

    this.electronService.electronEvents$.pipe(
      takeWhile(() => this.isAlive),
      filter(o => o.event === SAVE_SETTINGS_RESULT),
      pluck('body')
    ).subscribe((event) => {
      this.saveResultsHandler(event);
    });
  }

  sendSettingsHandler(settings) {
    this.zone.run(() => {
      this.settingsForm.controls['wordsCount'].setValue(settings.wordsCount);
      this.settingsForm.controls['wordsPerPage'].setValue(settings.wordsPerPage);
      this.settingsForm.controls['hardMode'].setValue(settings.hardMode);
    });
  }

  saveResultsHandler(result) {
    this.zone.run(() => {
      this.appComponent.showSnackBar(result.message, result.success);
      this.electronService.ipcRenderer.send(ASK_SETTINGS);
    });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  onFormSubmit(event: Event) {
    event.preventDefault();

    this.electronService.ipcRenderer.send(SAVE_SETTINGS, this.settingsForm.value);
  }
}