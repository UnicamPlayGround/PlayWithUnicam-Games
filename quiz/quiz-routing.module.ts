import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuizPage } from './quiz.page';

const routes: Routes = [
  {
    path: '',
    component: QuizPage
  },
  {
    path: 'quiz-editor',
    loadChildren: () => import('./quiz-editor/quiz-editor.module').then( m => m.QuizEditorPageModule)
  },
  {
    path: 'create-quiz-question',
    loadChildren: () => import('./create-quiz-question/create-quiz-question.module').then( m => m.CreateQuizQuestionPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuizPageRoutingModule {}
