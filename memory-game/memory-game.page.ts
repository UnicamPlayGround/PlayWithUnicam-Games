import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { HttpClient } from '@angular/common/http';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { GameLogicService } from './services/game-logic/game-logic.service';
import { MemoryCard } from './components/memory-card';
import { ModalController } from '@ionic/angular';
import { ClassificaPage } from 'src/app/modal-pages/classifica/classifica.page';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';
import { Router } from '@angular/router';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { MemoryPlayer } from './components/memory-player';
import jwt_decode from 'jwt-decode';


@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.page.html',
  styleUrls: ['./memory-game.page.scss'],
})
export class MemoryGamePage implements OnInit {

  time = 0;
  display;
  interval;

  localPlayerUsername: String;
  localPlayer: MemoryPlayer;

  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };

  private timerInfoPartita;

  selectedCards = [];

  constructor(
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private http: HttpClient,
    private errorManager: ErrorManagerService,
    private gameLogic: GameLogicService,
    private modalController: ModalController,
    private timerService: TimerServiceService,
    private router: Router,
    private lobbyManager: LobbyManagerService
  ) {
    this.gameLogic.ping();
    this.loadInfoLobby();
    this.timerInfoPartita = timerService.getTimer(() => { this.getInfoPartita() }, 2000);
    // this.setLocalPlayer();

  }

  async ngOnInit() {
    this.gameLogic.ngOnInit()
      .then(_ => {
        this.setLocalPlayer();
        this.startTimer();
      })
  }


  private async setLocalPlayer() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    this.localPlayerUsername = decodedToken.username;
    console.log("local: " + this.localPlayerUsername);
    this.gameLogic.players.forEach(player => {
      if (player.nickname == decodedToken.username) this.localPlayer = new MemoryPlayer(decodedToken.username);
    });
  }

  getCards() {
    return this.gameLogic.getCards()
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
      this.display = this.transform(this.time);
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

  endTurn() {
    this.gameLogic.endCurrentPlayerTurn();
    console.log("Ora è il turno di " + this.gameLogic.getCurrentPlayer().nickname);
  }

  selectCard(card: MemoryCard) {
    if (card.enabled && this.gameLogic.flippableCards && !this.selectedCards.includes(card)) {

      if (this.selectedCards.length < 2) {
        card.memory_card.revealCard();
        this.selectedCards.push(card);
      }

      console.log(this.selectedCards);

      if (this.selectedCards.length == 2) {
        this.gameLogic.flippableCards = false;

        setTimeout(() => {
          this.compareCards();
        }, 1000);
      }
    }
  }


  private compareCards() {
    if (this.selectedCards[0].title == this.selectedCards[1].title) {
      console.log("SONO UGUALI");
      this.localPlayer.guessedCards.push(this.selectedCards[0]);

      this.inviaDatiPartita(this.localPlayer.guessedCards.length);
      this.controllaFinePartita();

      this.selectedCards[0].enabled = false;
      this.selectedCards[1].enabled = false;
    }
    else {
      console.log("SONO DIVERSE");

      this.selectedCards[0].enabled = true;
      this.selectedCards[1].enabled = true;

      this.selectedCards[0].memory_card.coverCard();
      this.selectedCards[1].memory_card.coverCard();
    }

    this.selectedCards = [];
    this.gameLogic.flippableCards = true;
  }

  private controllaFinePartita() {
    var button = [{ text: 'Vai alla classifica', handler: () => { this.mostraClassifica(); } }];
    if (this.localPlayer.guessedCards.length == this.gameLogic.cards.length) {
      this.inviaDatiPartita(this.localPlayer.guessedCards.length);
      
      this.gameLogic.terminaPartita();
      this.alertCreator.createAlert("HAI VINTO!", "Complimenti, hai indovinato tutte le carte in " + this.display, button);
      this.timerService.stopTimers(this.timerInfoPartita, this.gameLogic.timerGiocatori);
      this.stopTimer();
    }
  }

  private async loadInfoLobby() {
    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
      },
      async (res) => {
        this.timerService.stopTimers(this.gameLogic.timerGiocatori, this.timerInfoPartita, this.gameLogic.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  private async inviaDatiPartita(info) {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue, 'info_giocatore': info }

    this.http.put('/game/save', toSend).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.gameLogic.timerGiocatori, this.timerInfoPartita, this.gameLogic.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
      }
    )
  }

  async mostraClassifica() {
    const modal = await this.modalController.create({
      component: ClassificaPage,
      componentProps: {
        classifica: this.calculateRanking()
      },
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then(async () => {
      this.timerService.stopTimers(this.gameLogic.timerPing);
      if (this.gameLogic.currentPlayer.nickname == this.lobby.admin_lobby)
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      else
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
    });

    return await modal.present();
  }

  private calculateRanking() {
    var classifica = [];
    var usernames = [];
    this.info_partita.info.giocatori.forEach(p => {
      if (p.username == this.localPlayer.nickname) {
        var toSave = { "username": this.localPlayer.nickname, "punteggio": this.gameLogic.cards.length }
        classifica.push(toSave);
        usernames.push(toSave.username);
      }else{
        toSave = { "username": p.username, "punteggio": p.info_giocatore }
        classifica.push(toSave);
        usernames.push(toSave.username);
      }
      
    });
    if (classifica.length < this.gameLogic.players.length) {
      for (let index = 0; index < this.gameLogic.players.length; index++) {
        if (!(usernames.includes(this.gameLogic.players[index].nickname))) {
          var toSave = { "username": this.gameLogic.players[index].nickname, "punteggio": 0 }
          classifica.push(toSave);
          usernames.push(toSave.username);
        }
      }
    }
    
    return this.sortRanking(classifica);
  }

  private sortRanking(classifica) {
    classifica.sort(function (a, b) {
      return b.punteggio - a.punteggio;
    });
    return classifica;
  }

  async getInfoPartita() {
    var button = [{ text: 'Vai alla classifica', handler: () => { this.mostraClassifica(); } }];
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'];
        console.log("this.info_partita " + JSON.stringify(res['results']));

        if (this.info_partita.info != null) {
          console.log("DOPO");

          this.info_partita.info.giocatori.forEach(p => {

            if (p.info_giocatore == this.gameLogic.cards.length) {
              if (p.username != this.localPlayer.nickname) {
                this.alertCreator.createAlert("PECCATO!", p.username + " ha vinto la partita", button);
                this.timerService.stopTimers(this.timerInfoPartita);
                this.stopTimer();
              }
            }
          });
        }
      },
      async (res) => {
        this.timerService.stopTimers(this.gameLogic.timerGiocatori, this.timerInfoPartita, this.gameLogic.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Recupero informazioni partita fallito!');
      }
    );
  }
  
}