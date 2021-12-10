import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CellQuestionPageRoutingModule } from './cell-question-routing.module';

import { CellQuestionPage } from './cell-question.page';
import { TimerComponent } from 'src/app/components/timer/timer.component';
import { SafePipe } from 'src/app/mgp_games/memory-game/modal-page/card-question/card-question.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CellQuestionPageRoutingModule
  ],
  declarations: [CellQuestionPage, SafePipe, TimerComponent]
})
export class CellQuestionPageModule { }
