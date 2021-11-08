import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { HttpClient } from '@angular/common/http';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';


@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.page.html',
  styleUrls: ['./memory-game.page.scss'],
})
export class MemoryGamePage implements OnInit {

  constructor(private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private http: HttpClient,
    private errorManager: ErrorManagerService) { }

  ngOnInit() {
    // this.getGameConfig();
    this.start();
  }

  figure2 = {
    game: "/memory-game",
    cards: [
      {
        nome: "cpu",
        link: "../../../assets/images/cpu.png",
        definizione: "Elabora informazioni"
      },
      {
        nome: "monitor",
        link: "../../../assets/images/pc.png",
        definizione: "Riproduce segnale video"
      },
      {
        nome: "cuffie",
        link: '../../../assets/images/headphones.png',
        definizione: "riproduce audio"
      },
      {
        nome: "stampante",
        link: "../../../assets/images/printer.png",
        definizione: "stampa"
      }
    ]
  };

  figure = this.figure2;



  time = 0;
  display;
  interval;

  carteSelezionate = [];
  carteScoperte = [];


  private raddoppiaCarte() {
    var tmp = this.figure2.cards.length;
    for (let index = 0; index < tmp; index++) {
      this.figure2.cards.push(this.figure2.cards[index]);
    }
  }

  //TODO: 
  private start() {
    this.raddoppiaCarte();
    this.mescolaCarte();
    this.startTimer();

    var grid = document.getElementById("grid");
    var row1 = document.getElementById("row1");
    var currentRow = row1;

    for (let i = 0; i < this.figure2.cards.length; i++) {
      if (i == this.figure2.cards.length / 2) {
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

  /**
   * Fa partire il timer del gioco.
   */
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

  /**
   * Trasforma il contatore dei secondi passati in input.
   * Esso ritornerà infatti il tempo seguendo il formato:
   * * *"minuti:secondi"* *
   * @param value la stringa relativa al conteggio passato in input
   * @returns 
   */
  private transform(value) {
    const minutes: number = Math.floor(value / 60);
    return minutes + ':' + (value - minutes * 60);
  }

  /**
   * Ferma il timer
   */
  private stopTimer() {
    clearInterval(this.interval);
  }

  /**
   * Mescola l'array delle carte
   * @param a array da mescolare
   */
  private mescolaCarte() {
    var currentIndex = this.figure2.cards.length;
    var temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.figure2.cards[currentIndex];
      this.figure2.cards[currentIndex] = this.figure2.cards[randomIndex];
      this.figure2.cards[randomIndex] = temporaryValue;
    }
  }

  /**
   * Scopre la carta relativa al numero passato in input
   * @param i numero finale dell'id della carta da scoprire
   */
  private scopriCarta(i) {
    var back = document.getElementById("back-img" + i);
    var card = document.getElementById("card" + i);
    // card.style.backgroundColor = "white"
    var front = document.getElementById("front-img" + i);

    back.style.display = 'none';
    front.style.marginTop = "35px";
    front.style.display = "inline";
  }

  /**
   * Copre la carta relativa al numero passato in input
   * @param i numero finale dell'id della carta da scoprire
   */
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

  /**
   * Controlla se le carte selezionate sono uguali oppure no.
   * Se sono uguali, le carte rimarranno scoperte e verranno inserite nell'array "carteScoperte", 
   * altrimenti verranno coperte di nuovo.
   */
  private controllaCarteSelezionate() {
    if (this.carteSelezionate.length == 2) {

      if (this.figure2.cards[this.carteSelezionate[0]] == this.figure2.cards[this.carteSelezionate[1]]) {
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
      if (this.carteScoperte.length == this.figure2.cards.length) {
        this.stopTimer();
        this.alertCreator.createInfoAlert("HAI VINTO!", "Hai concluso il gioco in: " + this.display)
      }
      this.carteSelezionate = [];
    }
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
    front.src = this.figure2.cards[i].link;
    card.appendChild(front);
    front.style.display = 'none';
    return card;
  }

  // async getGameConfig() {
  //   const token_value = (await this.loginService.getToken()).value;
  //   const headers = { 'token': token_value };

  //   this.http.get('/game/config', { headers }).subscribe(
  //     async (res) => {
  //       // console.log("config: "+res['results'][0].config)
  //       this.figure = res['results'][0].config;
  //       // this.uiBuilder.createGameBoard(this.cells);
  //       // this.loadPlayers();
  //     },
  //     async (res) => {
  //       // this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
  //       // this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
  //       this.errorManager.stampaErrore(res, 'File di configurazione mancante');
  //     }
  //   );
    
  // }
}
