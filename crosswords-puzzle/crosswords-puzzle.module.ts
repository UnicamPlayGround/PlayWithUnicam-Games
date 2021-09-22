import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrosswordsPuzzlePageRoutingModule } from './crosswords-puzzle-routing.module';

import { CrosswordsPuzzlePage } from './crosswords-puzzle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrosswordsPuzzlePageRoutingModule
  ],
  declarations: [CrosswordsPuzzlePage]
})
export class CrosswordsPuzzlePageModule {}
