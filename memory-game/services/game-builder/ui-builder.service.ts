import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiBuilderService {

  cards = [];
  carteSelezionate = [];
  carteScoperte = [];

  constructor() { }

  createGameBoard(cards) {
    this.cards = cards;

    var grid = document.getElementById("grid");
    var row1 = document.getElementById("row1");
    var currentRow = row1;

    for (let i = 0; i < this.cards.length; i++) {
      if (i == this.cards.length / 2) {
        var row2 = document.createElement("ion-row");
        grid.appendChild(row2);
        currentRow = row2;
      }
      var card = this.creaCarta(i);
      currentRow.appendChild(card);

      var space = this.aggiungiBordo();
      currentRow.appendChild(space);
    }
  }

  //TODO:
  private aggiungiBordo() {
    var space = document.createElement("div");
    space.classList.add("space");
    return space;
  }

  /**
 * Crea le carte necessarie per il tabellone
 * @param i numero finale dell'id relativo alla carta creata
 * @returns la carta
 */
  private creaCarta(i) {
    var card = document.createElement("div");
    card.id = "card" + i;
    card.classList.add("card");

    var back = document.createElement("img");
    back.src = "../../../assets/unicam-logo2.png";
    back.style.marginTop = "35px";
    back.style.marginLeft = "7px";
    back.id = "back-img" + i;
    card.appendChild(back);

    var front = document.createElement("img");
    front.id = "front-img" + i;
    front.src = this.cards[i].link;
    card.appendChild(front);
    front.style.display = 'none';
    return card;
  }
}
