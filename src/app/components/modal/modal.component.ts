import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';

const ANIMATION_DURATION_IN_MILISECONDS = 300;

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [
    trigger('modalBgState', [
      state('inactive', style({
        opacity: '0'
      })),
      state('active', style({
        opacity: '1'
      })),
      transition('active <=> inactive', animate(ANIMATION_DURATION_IN_MILISECONDS + 'ms ease'))
    ]),
    trigger('modalBodyState', [
      state('inactive', style({
        transform: 'scale(2)',
        opacity: '0'
      })),
      state('active', style({
        transform: 'scale(1)',
        opacity: '1'
      })),
      state('poke', style({
        transform: 'scale(0)',
        opacity: '0'
      })),
      transition('inactive => active', animate(ANIMATION_DURATION_IN_MILISECONDS + 'ms ease')),
      transition('active => poke', animate(ANIMATION_DURATION_IN_MILISECONDS + 'ms ease'))
    ])
  ]
})

export class ModalComponent {
  @Input() acceptText: string = '';
  @Input() dismissText: string = '';
  @Output() modalResult: EventEmitter<boolean> = new EventEmitter<boolean>();
  bgState = 'inactive';
  modalState = 'inactive';
  isShown = false;

  constructor() { }

  onButtonClick(result) {
    this.modalResult.emit(result);
  }

  // toggleBgState() {
  //   this.bgState = this.bgState === 'active' ? 'inactive' : 'active';
  // }

  show() {
    this.isShown = true;
    setTimeout(() => {
      this.bgState = this.modalState = 'active';
    }, 100);
  }

  hide(cb?) {
    this.bgState = 'inactive';
    this.modalState = 'poke';
    setTimeout(() => {
      this.isShown = false;
      this.modalState = 'inactive';
      cb && cb();
    }, ANIMATION_DURATION_IN_MILISECONDS);
  }

}