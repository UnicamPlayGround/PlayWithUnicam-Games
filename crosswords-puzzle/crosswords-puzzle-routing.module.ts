import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrosswordsPuzzlePage } from './crosswords-puzzle.page';

const routes: Routes = [
  {
    path: '',
    component: CrosswordsPuzzlePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrosswordsPuzzlePageRoutingModule {}
