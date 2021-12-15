import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryGameEditorPageRoutingModule } from './memory-game-editor-routing.module';

import { MemoryGameEditorPage } from './memory-game-editor.page';
import { MemoryCardComponentModule } from '../memory-card/memory-card.module';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryGameEditorPageRoutingModule,
    MemoryCardComponentModule,
    SharedComponentsModule
  ],
  declarations: [MemoryGameEditorPage]
})
export class MemoryGameEditorPageModule { }
