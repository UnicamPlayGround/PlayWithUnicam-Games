import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CellQuestionPageRoutingModule } from './cell-question-routing.module';

import { CellQuestionPage } from './cell-question.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CellQuestionPageRoutingModule
  ],
  declarations: [CellQuestionPage]
})
export class CellQuestionPageModule {}
