import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
import { MemoryCardComponent } from '../memory-card/memory-card.component';
import { CellQuestionPage } from 'src/app/mgp_games/goose-game/modal/cell-question/cell-question.page';
import { CardQuestionPage } from '../../modal-page/card-question/card-question.page';
import { CardQuestionPageModule } from '../../modal-page/card-question/card-question.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule,
    CardQuestionPageModule
  ],
  declarations: [GamePage, MemoryCardComponent]
})
export class GamePageModule { }
