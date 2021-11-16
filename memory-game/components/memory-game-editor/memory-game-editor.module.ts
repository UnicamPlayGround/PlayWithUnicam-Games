import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MemoryGameEditorComponent } from './memory-game-editor.component';
import { MemoryCardComponent } from '../memory-card/memory-card.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule
    ],
    exports: [MemoryGameEditorComponent, MemoryCardComponent],
    declarations: [MemoryGameEditorComponent, MemoryCardComponent],
})
export class MemoryGameEditorComponentModule { }