import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemoryGamePage } from './memory-game.page';

const routes: Routes = [
  {
    path: '',
    component: MemoryGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoryGamePageRoutingModule {}
