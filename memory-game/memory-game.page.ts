import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.page.html',
  styleUrls: ['./memory-game.page.scss'],
})
export class MemoryGamePage implements OnInit {

  constructor(private alertCreator: AlertCreatorService) { }

  ngOnInit() {
    this.start();
  }

  time: number = 0;
  display;
  interval;

  carteSelezionate = [];
  carteScoperte = [];
  arrayFigure = ['../../../assets/images/headphones.png', '../../../assets/images/headphones.png',
    '../../../assets/images/pc.png', '../../../assets/images/pc.png',
    '../../../assets/images/cpu.png', '../../../assets/images/cpu.png', '../../../assets/images/printer.png', '../../../assets/images/printer.png'];

  //TODO: 
  private start() {
    this.mescolaCarte(this.arrayFigure);
    this.startTimer();

    var grid = document.getElementById("grid");
    var row1 = document.getElementById("row1");
    var currentRow = row1;

    for (let i = 0; i < this.arrayFigure.length; i++) {
      if (i == this.arrayFigure.length / 2) {
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
  startTimer() {
    this.interval = setInterval(() => {
      if (this.time === 0) {
        this.time++;
      } else {
        this.time++;
      }
      this.display = this.transform(this.time)
    }, 1000);
  }

  //TODO: 
  private transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return minutes + ':' + (value - minutes * 60);
  }

  //TODO: 
  private stopTimer() {
    clearInterval(this.interval);
  }

  //TODO: 
  private mescolaCarte(a) {
    var currentIndex = a.length;
    var temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = a[currentIndex];
      a[currentIndex] = a[randomIndex];
      a[randomIndex] = temporaryValue;
    }
    this.arrayFigure = a;
  }

  //TODO: 
  private scopriCarta(i) {
    var back = document.getElementById("back-img" + i);
    var card = document.getElementById("card" + i);
    // card.style.backgroundColor = "white"
    var front = document.getElementById("front-img" + i);

    back.style.display = 'none';
    front.style.marginTop = "35px";
    front.style.display = "inline";
  }

  //TODO: 
  private copriCarta(i) {
    var front = document.getElementById("front-img" + i);
    var card = document.getElementById("card" + i);
    var back = document.getElementById("back-img" + i);
    // card.style.backgroundColor= "white";

    front.style.display = 'none';
    back.style.display = "inline"
  }

  //TODO: 
  private aggiungiBordo() {
    var space = document.createElement("div");
    space.classList.add("space");
    return space;
  }

  //TODO: 
  private controllaCarteSelezionate() {
    if (this.carteSelezionate.length == 2) {

      if (this.arrayFigure[this.carteSelezionate[0]] == this.arrayFigure[this.carteSelezionate[1]]) {
        this.carteScoperte.push(this.carteSelezionate[0]);
        this.carteScoperte.push(this.carteSelezionate[1]);

        var card1 = document.getElementById("card" + this.carteSelezionate[0]);
        card1.onclick = () => { };
        var card2 = document.getElementById("card" + this.carteSelezionate[1]);
        card2.onclick = () => { };
      } else {
        for (let index = 0; index < 2; index++) {
          this.copriCarta(this.carteSelezionate[index]);
        }
      }
      if (this.carteScoperte.length == this.arrayFigure.length) {
        this.stopTimer();
        this.alertCreator.createInfoAlert("HAI VINTO!", "Hai concluso il gioco in: " + this.display)
      }
      this.carteSelezionate = [];
    }
  }

  //TODO: 
  private creaCarta(i) {
    var card = document.createElement("div");
    card.id = "card" + i;
    card.classList.add("card");
    card.onclick = () => {

      if (this.carteSelezionate.length != 2) {
        this.scopriCarta(i);
        this.carteSelezionate.push(i);

        setTimeout(() => {
          this.controllaCarteSelezionate();
        }, 1000);
      }

    };

    var back = document.createElement("img");
    back.src = "../../../assets/unicam-logo2.png";
    back.style.marginTop = "35px";
    back.style.marginLeft = "7px";
    back.id = "back-img" + i;
    card.appendChild(back);

    var front = document.createElement("img");
    front.id = "front-img" + i;
    front.src = this.arrayFigure[i];
    card.appendChild(front);
    front.style.display = 'none';
    return card;
  }
}
