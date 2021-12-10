import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CardQuestionPageRoutingModule } from './card-question-routing.module';

import { CardQuestionPage } from './card-question.page';
import { TimerComponent } from 'src/app/components/timer/timer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardQuestionPageRoutingModule
  ],
  declarations: [CardQuestionPage, TimerComponent]
})
export class CardQuestionPageModule {}
