import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { HttpClient } from '@angular/common/http';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { UiBuilderService } from './services/game-builder/ui-builder.service';


@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.page.html',
  styleUrls: ['./memory-game.page.scss'],
})
export class MemoryGamePage implements OnInit {
  
  constructor(
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private http: HttpClient,
    private errorManager: ErrorManagerService,
    private uiBuilder: UiBuilderService
  ) { this.getGameConfig(); }

  ngOnInit() { }
  
  time = 0;
  display;
  interval;

  cards = [];
  carteSelezionate = [];
  carteScoperte = [];
  

private rendiCliccabiliCarte(){
  for (let index = 0; index < this.cards.length; index++) {
    var card = document.getElementById("card"+index);
    card.onclick = () => {

      if (this.carteSelezionate.length != 2) {
        this.scopriCarta(index);
        this.carteSelezionate.push(index);
  
        setTimeout(() => {
          this.controllaCarteSelezionate();
        }, 1000);
      }
  
    };
  }
}

//TODO:
  private raddoppiaCarte() {
    var tmp = this.cards.length;
    for (let index = 0; index < tmp; index++) {
      this.cards.push(this.cards[index]);
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
    var currentIndex = this.cards.length;
    var temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
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

  /**
   * Controlla se le carte selezionate sono uguali oppure no.
   * Se sono uguali, le carte rimarranno scoperte e verranno inserite nell'array "carteScoperte", 
   * altrimenti verranno coperte di nuovo.
   */
  private controllaCarteSelezionate() {
    if (this.carteSelezionate.length == 2) {

      if (this.cards[this.carteSelezionate[0]] == this.cards[this.carteSelezionate[1]]) {
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
      if (this.carteScoperte.length == this.cards.length) {
        this.stopTimer();
        this.alertCreator.createInfoAlert("HAI VINTO!", "Hai concluso il gioco in: " + this.display)
      }
      this.carteSelezionate = [];
    }
  }


  /**
   * ------------------------------ CHIAMATE REST ------------------------------
   */
  async getGameConfig() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/config', { headers }).subscribe(
      async (res) => {
        this.cards = res['results'][0].config.cards;

        this.raddoppiaCarte();
        this.mescolaCarte();
        this.uiBuilder.createGameBoard(this.cards);
        this.startTimer();
        this.rendiCliccabiliCarte();
        // this.loadPlayers();
      },
      async (res) => {
        // this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        // this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'File di configurazione mancante');
      }
    );
  }

}
