import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pixelart',
  templateUrl: './pixelart.page.html',
  styleUrls: ['./pixelart.page.scss'],
})
export class PixelartPage {
  n: number = 0;  //numero di righe/colonne 
  buttons;
  colorClasses: string[] = ["rosso", "verde", "giallo", "blu", "azzurro", "nero", "marrone", "arancione", "grigio", "viola", "bianco", "pix-error"];

  getDim(dim: number) {
    this.n = dim;
    this.buttons = Array.from(Array(this.n * this.n).keys());
  }

  cambio(n) {
    var colorSelect = localStorage.getItem('colorSelect');
    var pix = document.getElementById(n); //prende elemento tramite id
    try {

      pix.classList.remove(...this.colorClasses);
    } catch (error) {

    }
    pix.classList.add(colorSelect);
    pix.setAttribute("pixel-color", colorSelect);
  }

  // serve per far ritornare ogni cella della griglia al colore di default 
  pulisciDisegno(n) {
    let i: number;

    for (i = 0; i <= 99; i++) {
      let btn = document.getElementById('button' + i);
      var listaClassi = btn.classList;

      listaClassi.remove(...this.colorClasses); //rimozione delle classi 
      btn.setAttribute("pixel-color", "");
    }
  }

}
