import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GooseGameEditorComponent } from './goose-game-editor.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule
    ],
    exports: [GooseGameEditorComponent],
    declarations: [GooseGameEditorComponent]
})
export class GooseGameEditorComponentModule { }