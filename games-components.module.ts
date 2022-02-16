import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GooseGameEditorComponentModule } from './goose-game/components/goose-game-editor/goose-game-editor.module';
import { MemoryGameEditorPageModule } from './memory-game/components/memory-game-editor/memory-game-editor.module';
import { QuizEditorPageModule } from './quiz/quiz-editor/quiz-editor.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GooseGameEditorComponentModule,
    MemoryGameEditorPageModule,
    QuizEditorPageModule
  ],
  exports: [GooseGameEditorComponentModule, MemoryGameEditorPageModule, QuizEditorPageModule]
})
export class GamesComponentsModule { }
