import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreaParolaModalPage } from './crea-parola-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CreaParolaModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreaParolaModalPageRoutingModule {}
