import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MemoryCardComponent } from './memory-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [MemoryCardComponent],
  exports: [MemoryCardComponent]
})
export class MemoryCardComponentModule { }
