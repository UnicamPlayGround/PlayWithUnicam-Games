import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreaParolaModalPageRoutingModule } from './crea-parola-modal-routing.module';

import { CreaParolaModalPage } from './crea-parola-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreaParolaModalPageRoutingModule, 
    ReactiveFormsModule
  ],
  declarations: [CreaParolaModalPage]
})
export class CreaParolaModalPageModule {}
