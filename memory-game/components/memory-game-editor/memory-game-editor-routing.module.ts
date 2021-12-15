import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemoryGameEditorPage } from './memory-game-editor.page';

const routes: Routes = [
  {
    path: '',
    component: MemoryGameEditorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoryGameEditorPageRoutingModule {}
