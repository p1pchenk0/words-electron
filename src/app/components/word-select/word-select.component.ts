import { filter, pluck, takeWhile } from 'rxjs/operators';
import {
    GAME_RESULTS_SAVED, GET_WORD_LIST, SEND_GAME_RESULTS, WORD_LIST
} from 'src/app/common/events';
import { shuffle } from 'src/app/common/functions';
import { ElectronService } from 'src/app/services/electron.service';

import { Component, Inject, NgZone, OnDestroy, OnInit, Renderer2, ViewChildren, ElementRef, ViewChild } from '@angular/core';

import { AppComponent } from '../../app.component';
import { listAnimation, overTransition, slideDownAnimation } from '../../common/animations';
import { Word } from '../../models/word.model';
import { PreloaderService } from '../../services/preloader.service';
import { Settings } from '../../common/settings';
import { ActivatedRoute } from '@angular/router';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'word-select',
    templateUrl: './word-select.component.html',
    styleUrls: ['./word-select.component.scss'],
    animations: [slideDownAnimation, overTransition]
})

export class WordSelectComponent implements OnInit, OnDestroy {
    @ViewChildren('variantHtml') htmlVariants: ElementRef[];
    @ViewChild('errorsModal') errorsModal: ModalComponent;
    @ViewChildren('progressElement') progressElement: ElementRef[];
    mainWord: string;
    random = Math.random();
    currentIndex: number = 0;
    currentWord: Word;
    words: Word[];
    rightCounter: number = 0;
    wrongCounter: number = 0;
    wrongWords: Word[] = [] // TODO: массив со словами, которые надо вывести по окончанию игры для напоминания
    wordsForServer: Word[] = [];
    variants: any[] = [];
    isGameOver: boolean = false;
    isTournamentMode: boolean = false;
    nextRoundTimeout: number = 500;
    isAlive: boolean = true;
    displayWarning = false;
    players: any[] = [];

    constructor(
        private preloaderService: PreloaderService,
        private renderer: Renderer2,
        private zone: NgZone,
        private route: ActivatedRoute,
        @Inject(AppComponent) private appComponent: AppComponent,
        private electronService: ElectronService,
        private settings: Settings
    ) {
    }

    ngOnInit() {
        this.isTournamentMode = !!this.route.snapshot.queryParams.tournament;

        if (this.isTournamentMode) {
            this.players = [
                { color: 'blue', isActive: false, score: 0 },
                { color: 'crimson', isActive: false, score: 0 }
            ];

            this.activateRandomPlayer();
        }

        this.electronService.electronEvents$.pipe(
            takeWhile(() => this.isAlive),
            filter(o => o.event === WORD_LIST),
            pluck('body')
        ).subscribe((event) => {
            this.onGetWordsHandler(event);
        });

        this.electronService.electronEvents$.pipe(
            takeWhile(() => this.isAlive),
            filter(o => o.event === GAME_RESULTS_SAVED),
        ).subscribe(() => {
            this.saveResultsHandler();
        });

        this.preloaderService.showPreloader();
        this.electronService.send(GET_WORD_LIST);
    }

    getActivePlayer() {
        let activePlayerIndex = this.players.findIndex(player => player.isActive);
        return this.players[activePlayerIndex];
    }

    getNextPlayer() {
        let inactivePlayerIndex = this.players.findIndex(player => !player.isActive);
        let activePlayerIndex = this.players.findIndex(player => player.isActive);
        this.players[inactivePlayerIndex].isActive = true;
        this.players[activePlayerIndex].isActive = false;
    }

    activateRandomPlayer() {
        shuffle(this.players)[0].isActive = true;
    }

    getTextShadowColor() {
        return this.isTournamentMode ? { 'text-shadow': '0px 1px 0px ' + this.getActivePlayer().color } : {};
    }

    onGetWordsHandler(words) {
        this.zone.run(() => {
            this.preloaderService.hidePreloader();
            this.words = this.wordsForServer = shuffle(words);
            if (this.words.length >= 4) {
                this.prepareRound();
            } else {
                this.displayWarning = true;
            }
        });
    }

    saveResultsHandler() {
        this.zone.run(() => {
            this.appComponent.showSnackBar('Результаты сохранены', true);
        });
    }

    prepareRound() {
        let currentRound = (Math.random() > .5) ? 'english' : 'russian';
        if (this.currentIndex !== (this.words.length)) {
            this.random = Math.random();
            this.variants = [];
            this.currentWord = this.words[this.currentIndex];
            this.mainWord = (currentRound === 'russian') ? this.currentWord.russian[Math.floor(Math.random() * this.currentWord.russian.length)] : this.currentWord.english;
            let rightVariant = (currentRound === 'russian') ? this.currentWord.english : this.currentWord.russian[Math.floor(Math.random() * this.currentWord.russian.length)];
            this.variants.push({ value: rightVariant, display: rightVariant });
            let wordsForSelection = this.words;
            let otherWords: Word[] = this.getRandomArrayElements(wordsForSelection, 3, this.currentWord);
            let otherVariants = [];
            for (let variant of otherWords) {
                if (currentRound === 'russian') {
                    otherVariants.push({ value: variant.english, display: variant.english });
                } else {
                    let randomVariant = variant.russian[Math.floor(Math.random() * variant.russian.length)];
                    otherVariants.push({ value: randomVariant, display: randomVariant });
                }
            }
            this.variants = this.variants.concat(otherVariants);
            this.variants = shuffle(this.variants);
            if (Settings.settings.hardMode && Math.random() > 0.5) {
                this.variants[Math.floor(Math.random() * this.variants.length)].display = "Нет правильного варианта";
            }
        } else {
            this.endGame();
        }
    }

    getRandomArrayElements(arr, count, exclude) {
        let randomElements: string[] = arr.slice(); // cretae massive's copy
        let excludeIndex = arr.findIndex(c => c.english === exclude.english);
        randomElements.splice(excludeIndex, 1);
        let resultArray = [];
        for (let i = 0; i < count; i++) {
            let randomElement = randomElements.splice(Math.floor(Math.random() * randomElements.length - 1), 1)[0];
            resultArray.push(randomElement);
        }
        return resultArray;
    }

    checkSelectedVariant(variant, element: Event) {
        let selectedElement = element.target;
        if (this.currentIndex !== this.words.length) {
            if (this.currentWord.russian.includes(variant) || this.currentWord.english === variant) {
                this.progressElement.map((el, index) => {
                    index === this.currentIndex && this.renderer.addClass(el.nativeElement, 'right');
                });
                this.rightCounter++;
                this.currentWord.rightCount++;
                this.currentIndex++;
                this.renderer.addClass(selectedElement, 'right');
                this.isTournamentMode && this.getActivePlayer().score++;
                let rightIndex = this.variants.findIndex(el => el.value === this.currentWord.english || this.currentWord.russian.includes(el.value));
                this.variants[rightIndex].display = this.variants[rightIndex].value;
                setTimeout(() => {
                    this.renderer.removeClass(selectedElement, 'right');
                    if (this.currentIndex !== this.words.length) {
                        this.prepareRound()
                    } else {
                        this.endGame()
                    }
                }, this.nextRoundTimeout);
            } else {
                this.progressElement.map((el, index) => {
                    index === this.currentIndex && this.renderer.addClass(el.nativeElement, 'wrong');
                });
                !this.isTournamentMode && this.wrongWords.push(this.currentWord);
                this.isTournamentMode && this.getNextPlayer();
                this.wrongCounter++;
                this.currentWord.wrongCount++;
                !this.isTournamentMode && this.currentIndex++;
                let rightIndex = this.variants.findIndex(el => el.value === this.currentWord.english || this.currentWord.russian.includes(el.value));
                this.htmlVariants.map((el, index) => {
                    index === rightIndex && !this.isTournamentMode && this.renderer.addClass(el.nativeElement, 'right');
                    if (!this.isTournamentMode) this.variants[rightIndex].display = this.variants[rightIndex].value;
                });
                this.renderer.addClass(selectedElement, 'wrong');
                setTimeout(() => {
                    this.renderer.removeClass(selectedElement, 'wrong');
                    if (this.currentIndex !== this.words.length) {
                        !this.isTournamentMode && this.prepareRound()
                    } else {
                        this.endGame()
                    }
                }, this.nextRoundTimeout * 3);
            }
        }
    }

    endGame() {
        this.mainWord = '';
        this.variants = [];
        this.electronService.send(SEND_GAME_RESULTS, this.words);
        this.isGameOver = true;
    }

    newGame(words?: any[]) {
        this.isGameOver = false;
        this.currentIndex = this.wrongCounter = this.rightCounter = 0;
        if (!words) {
            this.wrongWords = [];
            this.electronService.send(GET_WORD_LIST);
        } else {
            this.onGetWordsHandler(words);
            this.wrongWords = [];
        }
        if (this.isTournamentMode) {
            this.players.forEach(player => player.score = 0);
            this.activateRandomPlayer();
        }
    }

    ngOnDestroy() {
        this.isAlive = false;
    }
}