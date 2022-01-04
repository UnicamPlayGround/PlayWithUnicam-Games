import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryGamePageRoutingModule } from './memory-multi-routing.module';

import { MemoryMultiGamePage } from './memory-multi.page';
import { MemoryCardComponentModule } from '../memory-card/memory-card.module';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';
import { ClassificaPageModule } from 'src/app/modal-pages/classifica/classifica.module';
import { QuestionModalPageModule } from 'src/app/modal-pages/question-modal/question-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryGamePageRoutingModule,
    QuestionModalPageModule,
    ClassificaPageModule,
    SharedComponentsModule,
    MemoryCardComponentModule
  ],
  declarations: [MemoryMultiGamePage]
})
export class MemoryMultiPageModule { }
