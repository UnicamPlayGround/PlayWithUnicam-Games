import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GooseGamePage } from './goose-game.page';

const routes: Routes = [
  {
    path: '',
    component: GooseGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GooseGamePageRoutingModule {}
