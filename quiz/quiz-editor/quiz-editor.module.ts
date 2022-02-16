import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuizEditorPageRoutingModule } from './quiz-editor-routing.module';

import { QuizEditorPage } from './quiz-editor.page';
import { CreateQuizQuestionPageModule } from '../create-quiz-question/create-quiz-question.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizEditorPageRoutingModule,
    CreateQuizQuestionPageModule
  ],
  declarations: [QuizEditorPage]
})
export class QuizEditorPageModule {}
