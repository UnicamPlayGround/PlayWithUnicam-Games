import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './memory-single-routing.module';

import { MemorySingleGamePage } from './memory-single.page';
import { QuestionModalPageModule } from 'src/app/modal-pages/question-modal/question-modal.module';
import { MemoryCardComponentModule } from '../memory-card/memory-card.module';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule,
    SharedComponentsModule,
    QuestionModalPageModule,
    MemoryCardComponentModule
  ],
  declarations: [MemorySingleGamePage]
})
export class MemorySinglePageModule { }
