import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateQuizQuestionPage } from './create-quiz-question.page';

const routes: Routes = [
  {
    path: '',
    component: CreateQuizQuestionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateQuizQuestionPageRoutingModule {}
