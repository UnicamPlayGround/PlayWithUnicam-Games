import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryGamePageRoutingModule } from './memory-game-routing.module';

import { MemoryGamePage } from './memory-game.page';
import { MemoryCardComponent } from '../components/memory-card/memory-card.component';
import { ClassificaPageModule } from 'src/app/modal-pages/classifica/classifica.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryGamePageRoutingModule,
    ClassificaPageModule
  ],
  declarations: [MemoryGamePage, MemoryCardComponent]
})
export class MemoryGamePageModule {}
