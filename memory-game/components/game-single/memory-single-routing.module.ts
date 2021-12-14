import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemorySingleGamePage } from './memory-single.page';

const routes: Routes = [
  {
    path: '',
    component: MemorySingleGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamePageRoutingModule {}
