import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PixelartPageRoutingModule } from './pixelart-routing.module';

import { PixelartPage } from './pixelart.page';
import { ScegliDisegnoComponent } from './components/scegli-disegno/scegli-disegno.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PixelartPageRoutingModule
  ],
  declarations: [PixelartPage, ScegliDisegnoComponent, ColorPickerComponent]
})
export class PixelartPageModule {}
