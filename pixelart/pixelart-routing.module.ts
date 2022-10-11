import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PixelartPage } from './pixelart.page';

const routes: Routes = [
  {
    path: '',
    component: PixelartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PixelartPageRoutingModule {}
