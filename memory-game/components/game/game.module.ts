import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
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
  declarations: [GamePage, MemoryCardComponent]
})
export class GamePageModule { }
