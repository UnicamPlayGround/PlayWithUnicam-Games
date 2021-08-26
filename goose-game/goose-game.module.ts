import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GooseGamePageRoutingModule } from './goose-game-routing.module';

import { GooseGamePage } from './goose-game.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GooseGamePageRoutingModule
  ],
  declarations: [GooseGamePage]
})
export class GooseGamePageModule {}
