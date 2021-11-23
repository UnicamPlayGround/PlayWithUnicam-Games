import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrls: ['./memory-card.component.scss'],
})
export class MemoryCardComponent implements OnInit {
  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('card') card = { link: "", nome: "", descrizione: "" };
  /**
   * Questo EventEmitter consente a questo component di comunicare con il suo parent emettendo
   * eventi contenenti determinati valori che saranno poi intercettati dal parent.
   */
  @Output() updateConfigEvent = new EventEmitter<Object>();

  constructor() { }

  ngOnInit() {
    const flipCard = <HTMLElement>document.getElementsByClassName("flip-card")[0];
    flipCard.addEventListener('click', () => {
      flipCard.style.transform = "rotateY(180deg);";
      let cardInner = <HTMLElement>document.getElementsByClassName('flip-card-inner')[0];
      cardInner.style.transform = "rotateY(180deg)";
    });
  }

  flipCard() {
    // document.getElementById('flip-card').style.transform = "rotateY(180deg);";
    // document.getElementById('flip-card-inner').style.transform = "rotateY(180deg)";
  }

}
