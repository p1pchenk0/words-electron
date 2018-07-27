import { Component } from '@angular/core';

import {
    WORD_ADD_TOOLTIP, WORD_LIST_TOOLTIP, WORD_MATCH_TOOLTIP, WORD_SELECT_TOOLTIP,
    WORD_SETTINGS_TOOLTIP,
    WORD_SELECT_TOURNAMENT_TOOLTIP
} from '../../common/hints';

@Component({
    selector: 'top-nav',
    templateUrl: './top-nav.component.html',
    styleUrls: ['./top-nav.component.scss']
})

export class TopNavComponent {
    matchTooltip = WORD_MATCH_TOOLTIP;
    selectTooltip = WORD_SELECT_TOOLTIP;
    selectTournamentTooltip = WORD_SELECT_TOURNAMENT_TOOLTIP;
    addTooltip = WORD_ADD_TOOLTIP;
    listTooltip = WORD_LIST_TOOLTIP;
    settingsTooltip = WORD_SETTINGS_TOOLTIP;
}