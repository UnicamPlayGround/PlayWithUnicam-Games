import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemoryGamePage } from './memory-game.page';

const routes: Routes = [
  {
    path: '',
    component: MemoryGamePage
  },  {
    path: 'card-question',
    loadChildren: () => import('./modal-page/card-question/card-question.module').then( m => m.CardQuestionPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoryGamePageRoutingModule { }
