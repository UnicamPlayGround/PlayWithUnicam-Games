import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CardQuestionPage } from './card-question.page';

const routes: Routes = [
  {
    path: '',
    component: CardQuestionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CardQuestionPageRoutingModule {}
