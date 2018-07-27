import { NgxPaginationModule } from 'ngx-pagination';
import { AddWordComponent } from 'src/app/components/add-word/add-word.component';
import { WordSelectComponent } from 'src/app/components/word-select/word-select.component';
import { ElectronService } from 'src/app/services/electron.service';
import { PreloaderService } from 'src/app/services/preloader.service';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule, MatInputModule, MatSelectModule, MatSnackBarModule,
  MatToolbarModule, MatTooltipModule, MatCheckboxModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { Settings } from './common/settings';
import { ModalComponent } from './components/modal/modal.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { WordButtonComponent } from './components/word-button/word-button.component';
import { WordListComponent } from './components/word-list/word-list.component';
import { WordMatchComponent } from './components/word-match/word-match.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'add-word', pathMatch: 'full' },
  { path: 'add-word', component: AddWordComponent, data: { state: 'add-word' } },
  { path: 'word-list', component: WordListComponent, data: { state: 'word-list' } },
  { path: 'select-word', component: WordSelectComponent, data: { state: 'word-select' } },
  { path: 'select-word-tournament', component: WordSelectComponent, data: { state: 'word-select-tournament' } },
  { path: 'match-words', component: WordMatchComponent, data: { state: 'match-words' } },
  { path: 'settings', component: SettingsComponent, data: { state: 'settings' } },
  // { path: 'statistics', component: WordStatisticsComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    AddWordComponent,
    WordButtonComponent,
    WordMatchComponent,
    WordSelectComponent,
    WordListComponent,
    SettingsComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatInputModule,
    NgxPaginationModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    ElectronService,
    PreloaderService,
    {
      provide: Settings,
      useClass: Settings
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
