import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemoryMultiGamePage } from './memory-multi.page';

const routes: Routes = [
  {
    path: '',
    component: MemoryMultiGamePage
  },
  {
    path: 'card-question',
    loadChildren: () => import('../../modal-page/card-question/card-question.module').then( m => m.CardQuestionPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoryGamePageRoutingModule { }
