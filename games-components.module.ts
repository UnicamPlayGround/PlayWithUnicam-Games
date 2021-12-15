import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GooseGameEditorComponentModule } from './goose-game/components/goose-game-editor/goose-game-editor.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GooseGameEditorComponentModule,
  ],
  exports: [GooseGameEditorComponentModule]
})
export class GamesComponentsModule { }
