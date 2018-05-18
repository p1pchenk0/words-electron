import { filter, pluck, takeWhile } from 'rxjs/operators';
import { NEW_WORD_RESULT, SEND_NEW_WORD } from 'src/app/common/events';
import { ElectronService } from 'src/app/services/electron.service';

import {
    ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnChanges,
    OnDestroy, OnInit, Output, Renderer2, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

import { AppComponent } from '../../app.component';
import { UPDATE_WORD, UPDATE_WORD_RESULT } from '../../common/events';
import { Word } from '../../models/word.model';

@Component({
    selector: 'add-word',
    templateUrl: './add-word.component.html',
    styleUrls: ['./add-word.component.scss']
})

export class AddWordComponent implements OnInit, OnDestroy, OnChanges {
    wordForm: FormGroup;
    @Input() wordToEdit: Word;
    @Output() wordUpdateResult = new EventEmitter<any>();
    @ViewChild('form') myForm;
    @ViewChild('english') englishInput: ElementRef;
    isAlive: boolean = true;

    constructor(private formBuilder: FormBuilder,
        private renderer: Renderer2,
        private electronService: ElectronService,
        @Inject(AppComponent) private appComponent: AppComponent,
        private zone: NgZone) {
        this.wordForm = this.wordToEdit ? formBuilder.group({
            english_word: [this.wordToEdit.english || '', Validators.required],
            russian_word_1: [this.wordToEdit.russian[0], Validators.required],
            russian_word_2: this.wordToEdit.russian[1] || '',
            russian_word_3: this.wordToEdit.russian[2] || '',
            russian_word_4: this.wordToEdit.russian[3] || ''
        }) : formBuilder.group({
            english_word: ['', Validators.required],
            russian_word_1: ['', Validators.required],
            russian_word_2: '',
            russian_word_3: '',
            russian_word_4: ''
        });
    }

    ngOnChanges() {
        this.wordForm = this.wordToEdit ? this.formBuilder.group({
            english_word: [this.wordToEdit.english || '', Validators.required],
            russian_word_1: [this.wordToEdit.russian[0], Validators.required],
            russian_word_2: this.wordToEdit.russian[1] || '',
            russian_word_3: this.wordToEdit.russian[2] || '',
            russian_word_4: this.wordToEdit.russian[3] || ''
        }) : this.formBuilder.group({
            english_word: ['', Validators.required],
            russian_word_1: ['', Validators.required],
            russian_word_2: '',
            russian_word_3: '',
            russian_word_4: ''
        });
    }

    ngOnInit() {
        this.electronService.electronEvents$.pipe(
            takeWhile(() => this.isAlive),
            filter(o => o.event === NEW_WORD_RESULT || o.event === UPDATE_WORD_RESULT),
            pluck('body')
        ).subscribe((result) => {
            this.newWordHander(result);
        });
    }

    ngOnDestroy() {
        this.isAlive = false;
    }

    newWordHander(res) {
        this.zone.run(() => {
            this.appComponent.showSnackBar(res.message, res.success);

            if (res.success) {
                this.wordToEdit && this.wordUpdateResult.emit(res.word);
                this.wordForm.reset({
                    english_word: undefined
                });
                this.myForm.resetForm();
                this.renderer.selectRootElement(this.englishInput.nativeElement).focus();
            }
        });
    }

    onAddWordSubmit(event: Event) {
        event.preventDefault();
        let newWord: Word = {
            english: this.wordForm.controls['english_word'].value.toLowerCase(),
            russian: [this.wordForm.controls['russian_word_1'].value.toLowerCase()],
            rightCount: 0,
            wrongCount: 0
        };
        if (this.wordForm.controls['russian_word_2'].value) {
            newWord.russian.push(this.wordForm.controls['russian_word_2'].value.toLowerCase())
        }
        if (this.wordForm.controls['russian_word_3'].value) {
            newWord.russian.push(this.wordForm.controls['russian_word_3'].value.toLowerCase())
        }
        if (this.wordForm.controls['russian_word_4'].value) {
            newWord.russian.push(this.wordForm.controls['russian_word_4'].value.toLowerCase())
        }
        if (this.wordToEdit) {
            newWord.rightCount = this.wordToEdit.rightCount;
            newWord.wrongCount = this.wordToEdit.wrongCount;
            newWord._id = this.wordToEdit._id;
        }
        this.electronService.send(this.wordToEdit ? UPDATE_WORD : SEND_NEW_WORD, newWord);
    }
}