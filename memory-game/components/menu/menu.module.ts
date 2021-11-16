import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryMenuPageRoutingModule } from './menu-routing.module';

import { MemoryMenuPage } from './menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryMenuPageRoutingModule
  ],
  declarations: [MemoryMenuPage]
})
export class MemoryMenuPageModule {}
