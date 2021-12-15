import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CellQuestionPageRoutingModule } from './cell-question-routing.module';

import { CellQuestionPage, SafePipe } from './cell-question.page';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CellQuestionPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [CellQuestionPage, SafePipe]
})
export class CellQuestionPageModule { }
