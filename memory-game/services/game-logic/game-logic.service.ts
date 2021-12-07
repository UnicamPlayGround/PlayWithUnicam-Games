import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { MemoryCard } from '../../components/memory-card';
import { MemoryPlayer } from '../../components/memory-player';
import { MemoryDataKeeperService } from '../data-keeper/data-keeper.service';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService implements OnInit {
  config;
  cards = [];
  memoryCards: MemoryCard[] = [];
  lobbyPlayers = [];
  players: MemoryPlayer[] = [];
  currentPlayer: MemoryPlayer;
  flippableCards: boolean;
  timerGiocatori;
  timerPing;

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private lobbyManager: LobbyManagerService,
    private timerService: TimerController,
    private router: Router,
    private errorManager: ErrorManagerService,
    private loginService: LoginService,
    private http: HttpClient) { }

  ngOnInit() { }

  initialization() {
    this.memoryCards = [];
    this.timerPing = this.timerService.getTimer(() => { this.ping() }, 4000);
    return new Promise((resolve, reject) => {
      this.getGameConfig()
        .then(_ => {
          this.flippableCards = true;
          return resolve(true);
        })
        .catch(error => reject(error))
    });
  }

  async ping() {
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, /*this.timerInfoPartita,*/ this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

  getGameConfig() {
    return new Promise(async (resolve, reject) => {
      const token_value = (await this.loginService.getToken()).value;
      const headers = { 'token': token_value };

      this.http.get('/game/config', { headers }).subscribe(
        async (res) => {
          this.config = res['results'][0].config;
          this.cards = res['results'][0].config.cards;
          this.setCards();
          this.setPlayers()
            .then(_ => { return resolve(true); })
            .catch(error => { return reject(error) });
        },
        async (res) => {
          reject();
          this.timerService.stopTimers(this.timerGiocatori, /*this.timerInfoPartita,*/ this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'File di configurazione mancante');
        }
      );
    });
  }

  async updatePlayers() {
    return new Promise(async (resolve, reject) => {
      (await this.lobbyManager.getPartecipanti()).subscribe(
        async (res) => {
          this.lobbyPlayers = res['results'];
          console.log("PLAYERS: " + this.lobbyPlayers);

          if (this.players.length == 0) this.setGamePlayers(); console.log("lunghezza su updatePlayers: " + this.players.length);
          return resolve(true);

          // if (this.players.length > this.lobbyPlayers.length) this.rimuoviGiocatore();
        },
        async (res) => {
          reject();
          this.timerService.stopTimers(this.timerGiocatori, /*this.timerInfoPartita,*/ this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'Impossibile caricare i giocatori!');
        });
    });

  }

  setGamePlayers() {
    this.lobbyPlayers.forEach(player => {
      const memoryPlayer = new MemoryPlayer(player.username)
      this.players.push(memoryPlayer);
    });
    this.currentPlayer = this.players[0];
    console.log("current: " + this.currentPlayer.nickname);
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  endCurrentPlayerTurn() {
    var index = this.players.indexOf(this.currentPlayer);
    if (index < (this.players.length - 1))
      this.currentPlayer = this.players[index + 1];
    else this.currentPlayer = this.players[0];
    this.flippableCards = !this.flippableCards;
  }

  private setPlayers() {
    if (this.config.version == "single") {
      let promise = new Promise((resolve) => { return resolve(true); });
      this.players = this.dataKeeper.getPlayers();
      this.currentPlayer = this.players[0];
      return promise;
    }
    else {
      return this.updatePlayers();
    }
  }

  getCards() {
    return this.memoryCards;
  }

  private setCards() {
    this.config.cards.forEach(card => {
      this.memoryCards.push(new MemoryCard(card.title, card.text, card.url));
      this.memoryCards.push(new MemoryCard(card.title, card.text, card.url));
    });
    this.shuffleCards();
  }

  private shuffleCards() {
    var currentIndex = this.memoryCards.length;
    var temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.memoryCards[currentIndex];
      this.memoryCards[currentIndex] = this.memoryCards[randomIndex];
      this.memoryCards[randomIndex] = temporaryValue;
    }
  }

  async terminaPartita() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    this.http.put('/partita/termina', toSend).subscribe(
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori/*, this.timerInfoPartita*/);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Terminazione partita fallita');
      });
  }

  // async leaveMatch() {
  //   this.timerService.stopTimers(this.timerPing, this.timerGiocatori, /*this.timerInfoPartita*/);
  //   (await this.lobbyManager.abbandonaLobby()).subscribe(
  //     async (res) => {
  //       this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
  //     },
  //     async (res) => {
  //       this.timerPing = this.timerService.getTimer(() => { this.ping() }, 4000);
  //       this.errorManager.stampaErrore(res, 'Abbandono fallito');
  //     }
  //   );
  // }
}
