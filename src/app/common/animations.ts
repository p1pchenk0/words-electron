import {
  animate, group, query, stagger, state, style, transition, trigger
} from '@angular/animations';

export const routerTransition = trigger('routerTransition', [
  transition('* <=> *', [
    query(':enter, :leave',
      style({
        zIndex: '-1', position: 'fixed', width: 'calc(100% - 30px)', height: 'calc(100% - 94px)', padding: '15px'
      }), { optional: true }),
    group([
      query(':enter', [
        style({ opacity: '0', zIndex: '10' }),
        animate('.5s ease', style({ opacity: '1' }))
      ], { optional: true }),
      query(':leave', [
        style({ opacity: '1', zIndex: '5' }),
        animate('.5s ease', style({ opacity: '0' }))
      ], { optional: true }),
    ])
  ])
]);

export const overTransition = trigger('overTransition', [
  transition('* <=> *', [
    query(':enter, :leave',
      style({
        zIndex: '-1', position: 'absolute', width: 'calc(100% - 30px)'
      }), { optional: true }),
    group([
      query(':enter', [
        style({ opacity: '0', zIndex: '10' }),
        animate('10s ease', style({ opacity: '1' }))
      ], { optional: true }),
      query(':leave', [
        style({ opacity: '1', zIndex: '5' }),
        animate('0s ease', style({ opacity: '0' }))
      ], { optional: true }),
    ])
  ])
]);

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'scale(1.1)' }),
      stagger(100, [
        animate('.2s ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ], { optional: true })
  ])
]);

export const disappearAnimation = trigger('disappear', [
  state('in', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
  transition('in => void', [
    animate('.33s ease-out', style({ opacity: 0, transform: 'scale(0) translateY(-50%)' }))
  ])
]);

export const slideDownAnimation = trigger('slideDown', [
  transition('* <=> *', [
    query(':enter, :leave',
      style({
        position: 'absolute',
        left: '0',
        right: '0'
      }), { optional: true }),
    group([
      query(':enter', [
        style({ opacity: '0', transform: 'translateY(-50%)' }),
        animate('.3s ease', style({ opacity: '1', transform: 'translateY(0%)' }))
      ], { optional: true }),
      query(':leave', [
        style({ opacity: '1', transform: 'translateY(0%)' }),
        animate('.3s ease', style({ opacity: '0', transform: 'translateY(100%)' }))
      ], { optional: true }),
    ], )
  ])
]);

export const searchBarAnimation = trigger('searchBar', [
  state('out', style({ opacity: 0, width: 0, transform: 'translateY(100%), translateX(100%)' })),
  state('in', style({ opacity: 1, width: '*', transform: 'translateY(0%), translateX(0%)' })),
  transition('out <=> in', [
    animate('.33s ease')
  ])
]);