import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'word-button',
    templateUrl: 'word-button.component.html',
    styleUrls: ['word-button.component.scss']
})

export class WordButtonComponent {
    @Input() buttonText: string;
    @Input() color: string;
}