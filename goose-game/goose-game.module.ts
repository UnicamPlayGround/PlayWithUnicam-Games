import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GooseGamePageRoutingModule } from './goose-game-routing.module';

import { GooseGamePage } from './goose-game.page';
import { ClassificaPageModule } from '../../modal-pages/classifica/classifica.module';
import { DadiPageModule } from 'src/app/modal-pages/dadi/dadi.module';
import { QuestionModalPageModule } from 'src/app/modal-pages/question-modal/question-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GooseGamePageRoutingModule,
    QuestionModalPageModule,
    ClassificaPageModule,
    DadiPageModule
  ],
  declarations: [GooseGamePage]
})
export class GooseGamePageModule { }
