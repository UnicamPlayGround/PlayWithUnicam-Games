import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemoryMultiGamePage } from './memory-multi.page';

const routes: Routes = [
  {
    path: '',
    component: MemoryMultiGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoryGamePageRoutingModule { }
