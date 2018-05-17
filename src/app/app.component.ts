import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { routerTransition } from './common/animations';
import { ASK_SETTINGS } from './common/events';
import { Settings } from './common/settings';
import { ElectronService } from './services/electron.service';
import { PreloaderService } from './services/preloader.service';

@Component({
  selector: 'app-root',
  animations: [routerTransition],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public showPreloader = false;
  constructor(
    public preloaderService: PreloaderService,
    private electronService: ElectronService,
    private changeDetector: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    public settings: Settings
  ) { }

  getState(outlet) {
    return outlet.activatedRouteData.state;
  }

  ngOnInit() {
    this.electronService.ipcRenderer.send(ASK_SETTINGS);
    this.preloaderService.getPreloaderState().subscribe((state) => {
      this.showPreloader = state;
      this.changeDetector.detectChanges();
    });
  }

  showSnackBar(message = '', success = true, time = 3000) {
    this.snackBar.open(message, '', {
      duration: time,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: success ? 'success' : 'error'
    });
  }
}