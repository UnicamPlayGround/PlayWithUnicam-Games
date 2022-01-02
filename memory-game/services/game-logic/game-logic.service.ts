import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from 'src/app/modal-pages/question-modal/question';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { MemoryCard } from '../../components/memory-card';
import { MemoryPlayer } from '../../components/memory-player';
import { MemoryDataKeeperService } from '../data-keeper/data-keeper.service';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService {
  config: any;
  memoryCards: MemoryCard[] = [];
  lobbyPlayers = [];
  players: MemoryPlayer[] = [];
  currentPlayer: MemoryPlayer;
  flippableCards: boolean;

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private lobbyManager: LobbyManagerService,
    private router: Router,
    private errorManager: ErrorManagerService,
    private loginService: LoginService,
    private http: HttpClient) { }

  //TODO commentare

  initialize() {
    this.memoryCards = [];
    return new Promise<void>((resolve, reject) => {
      this.getGameConfig()
        .then(_ => {
          this.flippableCards = true;
          return resolve();
        })
        .catch(error => reject(error))
    });
  }

  reset() {
    this.config = {};
    this.memoryCards = [];
    this.lobbyPlayers = [];
    this.players = [];
    this.currentPlayer = null;
    this.flippableCards = false;
  }

  async ping() {
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
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
          this.setCards();
          this.setPlayers()
            .then(_ => { return resolve(true); })
            .catch(error => { return reject(error) });
        },
        async (res) => {
          reject();
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'File di configurazione mancante');
        }
      );
    });
  }

  async updatePlayers() {
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.getPartecipanti()).subscribe(
        async (res) => {
          this.lobbyPlayers = res['results'];

          if (this.players.length == 0)
            this.setGamePlayers();
          return resolve();
        },
        async (res) => {
          reject();
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
    else { return this.updatePlayers(); }
  }

  getCards() {
    return this.memoryCards;
  }

  private setCards() {
    this.config.cards.forEach(card => {
      this.memoryCards.push(new MemoryCard(card.title, card.text, card.url, new Question(card.question.question, card.question.answers, card.url, null, card.question.countdown_seconds)));
      this.memoryCards.push(new MemoryCard(card.title, card.text, card.url, new Question(card.question.question, card.question.answers, card.url, null, card.question.countdown_seconds)));    });
    this.shuffleCards();
  }

  private shuffleCards() {
    var currentIndex = this.memoryCards.length;
    var temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      //TODO: Migliorare algoritmo per mischiare le carte
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
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Terminazione partita fallita');
      });
  }

}