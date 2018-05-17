import * as masonry from 'masonry-layout';
import { filter, pluck, takeWhile } from 'rxjs/operators';
import { GET_WORD_LIST } from 'src/app/common/events';
import { shuffle } from 'src/app/common/functions';
import { ElectronService } from 'src/app/services/electron.service';
import { PreloaderService } from 'src/app/services/preloader.service';

import {
    ChangeDetectorRef, Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, Renderer2,
    ViewChild
} from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { AppComponent } from '../../app.component';
import { disappearAnimation } from '../../common/animations';
import { GAME_RESULTS_SAVED, SEND_GAME_RESULTS, WORD_LIST } from '../../common/events';
import { Word } from '../../models/word.model';

@Component({
    selector: 'word-match',
    templateUrl: './word-match.component.html',
    styleUrls: ['./word-match.component.scss'],
    animations: [disappearAnimation]
})

export class WordMatchComponent implements OnInit, OnDestroy {
    @ViewChild('gridContainer') gridContainer: ElementRef;
    grid: any;
    msnry: any;
    cards: any[] = [];
    cardsWithResult: Word[]; // слова для отправки на сервер с новой статистикой по каждому слову
    referenceSuit: any[]; // массив слов для проверки правильного выбора англ слова и его перевода
    pairOfCardsToCompare: any[] = [];
    pairOfDOMElements: any[] = [];
    gameIsOver: boolean = false;
    isAlive: boolean = true;

    constructor(private cd: ChangeDetectorRef,
        private electronService: ElectronService,
        private preloaderService: PreloaderService,
        private zone: NgZone,
        private snackBar: MatSnackBar,
        @Inject(AppComponent) private appComponent: AppComponent,
        private renderer: Renderer2) {
    }

    renderMasonry() {
        this.cd.detectChanges();
        // setTimeout(() => {
        this.grid = document.querySelector('.grid');

        if (!this.msnry) {
            this.msnry = new masonry(this.grid, {
                itemSelector: '.grid-item',
                columnWidth: '.grid-sizer',
                percentPosition: true,
                gutter: 15
            });
        } else {
            this.msnry.layout();
        }
        // }, 0);
        this.cd.detectChanges();
    }

    ngOnInit() {
        this.electronService.ipcRenderer.send(GET_WORD_LIST);
        this.preloaderService.showPreloader();

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
    }

    onGetWordsHandler(words) {
        this.cardsWithResult = words;
        let translations = [];
        let english = [];

        for (let word of words) {
            let chosenTranslation = word.russian[Math.floor(Math.random() * word.russian.length)];
            let translation = {
                word: chosenTranslation,
                translation: word.english,
                isEnglish: false,
                selected: false
            };

            translations.push(translation);
            english.push({
                word: word.english,
                translation: chosenTranslation,
                id: word._id,
                isEnglish: true,
                selected: false,
                wrongCount: word.wrongCount,
                rightCount: word.rightCount
            });
        }

        this.cards = shuffle(translations.concat(english));
        this.zone.run(() => {
            this.renderMasonry();
            this.preloaderService.hidePreloader();
        });
    }

    saveResultsHandler() {
        this.zone.run(() => {
            this.appComponent.showSnackBar('Результаты сохранены', true);
        });
    }

    compareCards(card, event: Event) {
        if (this.pairOfCardsToCompare.length < 2) { // выбираем две карточки для сравнения
            card.selected = true;
            this.pairOfCardsToCompare.push(card);
            this.pairOfDOMElements.push(event.target);
        }
        if (this.pairOfCardsToCompare.length === 2) { // сравниваем карточки
            let firstCard = this.pairOfCardsToCompare[0];
            let secondCard = this.pairOfCardsToCompare[1];

            if (firstCard.isEnglish ^ secondCard.isEnglish) { // карточки выбраны корректные, проверяем
                let cardWithEnglishWord = (firstCard.isEnglish) ? firstCard : secondCard;
                let cardWithTranslationWord = (firstCard.isEnglish) ? secondCard : firstCard;
                let indexOfWord = this.cardsWithResult.findIndex(w => w.english === cardWithEnglishWord.word);

                if (cardWithEnglishWord.translation === cardWithTranslationWord.word) {
                    this.renderer.addClass(this.gridContainer.nativeElement, 'no-events');
                    this.pairOfDOMElements.forEach((el) => {
                        this.renderer.addClass(el, 'right');
                    });
                    this.cardsWithResult[indexOfWord].rightCount++;
                    setTimeout(() => {
                        this.renderer.removeClass(this.gridContainer.nativeElement, 'no-events');
                        let indexOfFirstCardToDelete = this.cards.findIndex(c => c.word === cardWithEnglishWord.word);
                        this.cards.splice(indexOfFirstCardToDelete, 1);
                        let indexOfSecondCardToDelete = this.cards.findIndex(c => c.word === cardWithTranslationWord.word);
                        this.cards.splice(indexOfSecondCardToDelete, 1);
                        this.pairOfCardsToCompare = [];
                        if (!this.cards.length) {
                            this.electronService.ipcRenderer.send(SEND_GAME_RESULTS, this.cardsWithResult);
                            this.gameIsOver = true;
                        }
                    }, 1000);
                } else {
                    this.cardsWithResult[indexOfWord].wrongCount++;
                    this.pairOfDOMElements.forEach((el) => {
                        this.renderer.addClass(el, 'wrong');
                    });
                    setTimeout(() => {
                        this.pairOfDOMElements.forEach((el) => {
                            this.renderer.removeClass(el, 'wrong');
                        });
                        this.resetSelection(firstCard, secondCard);
                    }, 1000);
                }
            } else { // неверное сравнение карточек (в отдельную функцию)
                this.resetSelection(firstCard, secondCard);
            }
        }
    }

    startNewGame() {
        this.gameIsOver = false;
        this.msnry = null;
        this.electronService.ipcRenderer.send(GET_WORD_LIST);
    }

    resetSelection(cardOne, cardTwo) {
        cardOne.selected = cardTwo.selected = false;
        this.pairOfCardsToCompare = [];
        this.pairOfDOMElements = [];
    }

    ngOnDestroy() {
        this.isAlive = false;
    }
}