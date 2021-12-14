import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './memory-single-routing.module';

import { MemorySingleGamePage } from './memory-single.page';
import { MemoryCardComponent } from '../memory-card/memory-card.component';
import { QuestionModalPageModule } from 'src/app/modal-pages/question-modal/question-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule,
    QuestionModalPageModule
  ],
  declarations: [MemorySingleGamePage, MemoryCardComponent]
})
export class MemorySinglePageModule { }
