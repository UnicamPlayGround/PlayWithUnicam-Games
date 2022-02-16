import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateQuizQuestionPageRoutingModule } from './create-quiz-question-routing.module';

import { CreateQuizQuestionPage } from './create-quiz-question.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateQuizQuestionPageRoutingModule
  ],
  declarations: [CreateQuizQuestionPage]
})
export class CreateQuizQuestionPageModule {}
