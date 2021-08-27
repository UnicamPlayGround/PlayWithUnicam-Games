import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CellQuestionPage } from './cell-question.page';

const routes: Routes = [
  {
    path: '',
    component: CellQuestionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CellQuestionPageRoutingModule {}
