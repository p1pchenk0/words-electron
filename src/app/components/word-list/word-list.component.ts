import { filter, pluck, takeWhile } from 'rxjs/operators';
import { PreloaderService } from 'src/app/services/preloader.service';

import {
  ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild, ViewChildren, ElementRef, Renderer2
} from '@angular/core';

import { AppComponent } from '../../app.component';
import { listAnimation, searchBarAnimation } from '../../common/animations';
import {
  DELETE_WORD, DELETE_WORD_RESULT, GET_WORD_LIST, GET_WORDS_COUNT, SENT_WORDS_COUNT, WORD_LIST
} from '../../common/events';
import { Word } from '../../models/word.model';
import { ElectronService } from '../../services/electron.service';
import { ModalComponent } from '../modal/modal.component';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

@Component({
  selector: 'word-list',
  templateUrl: './word-list.component.html',
  styleUrls: ['./word-list.component.scss'],
  animations: [listAnimation, searchBarAnimation]
})

export class WordListComponent implements OnInit, OnDestroy {
  searchWords = '';
  searchWordsControl = new FormControl();
  searchBarState = 'out';
  pageNum: number = 1;
  wordsCount: number;
  wordsPerPage: number;
  sortOrder: string;
  sortProperty: string;
  @ViewChildren('sort') sortColumns: ElementRef[];
  @ViewChild('deleteModal') deleteModal: ModalComponent;
  @ViewChild('editModal') editModal: ModalComponent;
  @ViewChild('searchInput') searchInput: ElementRef;
  words: Word[] = [];
  deleteCandidateWord: Word;
  wordToDelete: string = '';
  deleteModalIsOpen: boolean = false;
  editModalIsOpen: boolean = false;
  currentEditWord: Word;
  isLoaded: boolean = false;
  isAlive: boolean = true;

  constructor(
    private electronService: ElectronService,
    private preloaderService: PreloaderService,
    private changeDetector: ChangeDetectorRef,
    private renderer: Renderer2,
    private zone: NgZone,
    @Inject(AppComponent) private appComponent: AppComponent
  ) { }

  toggleSearchBar() {
    this.searchBarState = this.searchBarState === 'out' ? 'in' : 'out';
    this.searchBarState === 'in' && this.searchInput && this.renderer.selectRootElement(this.searchInput.nativeElement).focus();
    if (this.searchBarState === 'out') this.searchWordsControl.setValue('');
  }

  sortBy(event, prop) {
    this.sortColumns.map((column) => {
      this.renderer.removeClass(column.nativeElement, 'active');
    });
    this.renderer.addClass(event.target, 'active');
    let sortOrder = event.target.getAttribute('order') === 'asc' ? 'desc' : 'asc';
    this.renderer.setAttribute(event.target, 'order', sortOrder);
    this.sortProperty = prop;
    this.sortOrder = sortOrder;
    this.changePage(1);
  }

  ngOnInit() {
    this.electronService.electronEvents$.pipe(
      takeWhile(() => this.isAlive),
      filter(o => o.event === WORD_LIST),
      pluck('body')
    ).subscribe((event: any) => {
      this.onGetWordsHandler(event);
    });

    this.electronService.electronEvents$.pipe(
      takeWhile(() => this.isAlive),
      filter(o => o.event === DELETE_WORD_RESULT),
      pluck('body')
    ).subscribe((event) => {
      this.onDeleteWordHandler(event);
    });

    this.electronService.electronEvents$.pipe(
      takeWhile(() => this.isAlive),
      filter(o => o.event === SENT_WORDS_COUNT),
      pluck('body')
    ).subscribe((event: any) => {
      this.onWordsCountHandler(event);
    });

    this.preloaderService.showPreloader();
    this.electronService.send(GET_WORDS_COUNT);

    this.searchWordsControl.valueChanges.pipe(debounceTime(300)).subscribe((request) => {
      this.pageNum = 1;
      this.searchWords = request;
      this.electronService.send(GET_WORD_LIST, { page: this.pageNum }, request);
    });
  }

  changePage(pageNumber) {
    this.pageNum = pageNumber;
    this.electronService.send(GET_WORD_LIST, {
      page: this.pageNum,
      order: this.sortOrder,
      sortBy: this.sortProperty
    }, this.searchWords);
  }

  onDeleteWordHandler(result) {
    this.zone.run(() => {
      if (result.success) {
        let wordToDelete = this.words.findIndex(w => w.english === this.deleteCandidateWord.english);
        this.words.splice(wordToDelete, 1);
        if (this.pageNum > 1 && !this.words.length) { // if no words left on current page, go to previous one
          this.changePage(this.pageNum - 1);
        }
        this.electronService.send(GET_WORDS_COUNT);
        this.closeDeleteModal();
      }
      this.appComponent.showSnackBar(result.message, result.success);
    });
  }

  onWordsCountHandler({ count, wordsPerPage }) {
    this.zone.run(() => {
      this.wordsCount = count;
      this.wordsPerPage = wordsPerPage;
      this.electronService.send(GET_WORD_LIST, { page: this.pageNum });
    });
  }

  onGetWordsHandler({ words, count }) {
    this.zone.run(() => {
      this.words = words;
      this.wordsCount = count;
      this.isLoaded = true;
      this.preloaderService.hidePreloader();
    });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  onDeleteModalResult(event) {
    if (event) {
      this.deleteWord(this.deleteCandidateWord);
    } else {
      this.closeDeleteModal();
    }
  }

  onEditModalResult(event) {
    if (!event) {
      this.closeEditModal();
    }
  }

  deleteWord(word) {
    this.electronService.send(DELETE_WORD, word);
  }

  openDeleteModal(word: Word) {
    this.deleteCandidateWord = word;
    this.wordToDelete = word.english;
    this.changeDetector.detectChanges();
    this.deleteModal.show();
  }

  closeDeleteModal() {
    this.deleteModal.hide(() => {
      this.wordToDelete = '';
    });
  }

  onWordUpdate(result) {
    if (result) {
      let indexOfUpdatedWord = this.words.findIndex(w => w._id === result._id);
      this.words[indexOfUpdatedWord] = result;
      this.closeEditModal();
    }
  }

  openEditModal(word: Word) {
    this.currentEditWord = word;
    this.changeDetector.detectChanges();
    this.editModal.show();
  }

  closeEditModal() {
    this.editModal.hide();
  }
}