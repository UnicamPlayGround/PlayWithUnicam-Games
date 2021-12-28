import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryGamePageRoutingModule } from './memory-multi-routing.module';

import { MemoryMultiGamePage } from './memory-multi.page';
import { MemoryCardComponentModule } from '../memory-card/memory-card.module';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';
import { ClassificaDinamicaPageModule } from 'src/app/modal-pages/classifica-dinamica/classifica-dinamica.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryGamePageRoutingModule,
    ClassificaDinamicaPageModule,
    SharedComponentsModule,
    MemoryCardComponentModule
  ],
  declarations: [MemoryMultiGamePage]
})
export class MemoryMultiPageModule { }
