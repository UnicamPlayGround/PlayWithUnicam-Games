import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GooseGamePage } from './goose-game.page';

const routes: Routes = [
  {
    path: '',
    component: GooseGamePage
  },
  {
    path: 'editor',
    loadChildren: () => import('./editor/editor.module').then( m => m.EditorPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GooseGamePageRoutingModule {}
