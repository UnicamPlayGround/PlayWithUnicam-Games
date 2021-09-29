import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditorPageRoutingModule } from './editor-routing.module';

import { EditorPage } from './editor.page';
import { CreaParolaModalPage } from '../crea-parola-modal/crea-parola-modal.page';
import { CreaParolaModalPageModule } from '../crea-parola-modal/crea-parola-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EditorPageRoutingModule,
    CreaParolaModalPageModule
  ],
  declarations: [EditorPage]
})
export class EditorPageModule {}
