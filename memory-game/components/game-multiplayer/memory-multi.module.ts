import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryGamePageRoutingModule } from './memory-multi-routing.module';

import { MemoryMultiGamePage } from './memory-multi.page';
import { MemoryCardComponent } from '../memory-card/memory-card.component';
import { ClassificaPageModule } from 'src/app/modal-pages/classifica/classifica.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryGamePageRoutingModule,
    ClassificaPageModule
  ],
  declarations: [MemoryMultiGamePage, MemoryCardComponent]
})
export class MemoryGamePageModule {}
