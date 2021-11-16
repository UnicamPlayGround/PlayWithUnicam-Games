import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GooseGameEditorComponentModule } from './goose-game/components/goose-game-editor/goose-game-editor.module';
import { MemoryGameEditorComponentModule } from './memory-game/components/memory-game-editor/memory-game-editor.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GooseGameEditorComponentModule,
    MemoryGameEditorComponentModule
  ],
  exports: [GooseGameEditorComponentModule, MemoryGameEditorComponentModule]
})
export class GamesComponentsModule { }
