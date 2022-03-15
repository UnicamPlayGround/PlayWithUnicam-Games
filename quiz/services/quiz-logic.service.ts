import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { QuizQuestion } from '../quiz-question';

@Injectable({
  providedIn: 'root'
})
export class QuizLogicService {
  config: any;
  quizQuestions: QuizQuestion[] = [];
  lobbyPlayers = [];
  // players: MemoryPlayer[] = [];
  // currentPlayer: MemoryPlayer;
  // flippableCards: boolean;
  redirectPath: string;

  constructor(
    private lobbyManager: LobbyManagerService,
    private router: Router,
    private errorManager: ErrorManagerService,
    private loginService: LoginService,
    private http: HttpClient) {
    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente) {
          if (tipoUtente == "ADMIN") this.redirectPath = '/admin/dashboard';
          else this.redirectPath = '/player/dashboard';
        }
      }
    );
  }

  initialize() {
    this.quizQuestions = [];
    return new Promise<void>((resolve, reject) => {
      this.getGameConfig()
        .then(_ => {
          return resolve();
        })
        .catch(error => reject(error))
    });
  }

  reset() {
    this.config = {};
    this.quizQuestions = [];
    this.lobbyPlayers = [];
  }

  async ping() {
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.ping()).subscribe(
        async (res) => { return resolve(); },
        async (res) => { reject(res); }
      );
    })
  }

  getGameConfig() {
    return new Promise(async (resolve, reject) => {
      const token_value = (await this.loginService.getToken()).value;
      const headers = { 'token': token_value };

      this.http.get('/game/config', { headers }).subscribe(
        async (res) => {
          this.config = res['results'][0].config;
          this.setQuizQuestions();
          this.setPlayers()
            .then(_ => { return resolve(true); })
            .catch(error => { return reject(error) });
        },
        async (res) => { return reject(res); }
      );
    });
  }

  async updatePlayers() {
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.getPartecipanti()).subscribe(
        async (res) => {
          this.lobbyPlayers = res['results'];

          // if (this.players.length == 0)
          //   this.setGamePlayers();
          return resolve();
        },
        async (res) => { return reject(res); });
    });

  }

  setGamePlayers() {
    // this.lobbyPlayers.forEach(player => {
    //   const memoryPlayer = new MemoryPlayer(player.username)
    //   this.players.push(memoryPlayer);
    // });
    // this.currentPlayer = this.players[0];
  }

  getCurrentPlayer() {
    // return this.currentPlayer;
  }

  endCurrentPlayerTurn() {
    // var index = this.players.indexOf(this.currentPlayer);
    // if (index < (this.players.length - 1))
    //   this.currentPlayer = this.players[index + 1];
    // else this.currentPlayer = this.players[0];
    // this.flippableCards = !this.flippableCards;
  }

  private setPlayers() {
    if (this.config.version == "single") {
      let promise = new Promise((resolve) => { return resolve(true); });
      // this.players = this.dataKeeper.getPlayers();
      // this.currentPlayer = this.players[0];
      return promise;
    }
    else { return this.updatePlayers(); }
  }

  getQuizQuestions() {
    return this.quizQuestions;
  }

  private setQuizQuestions() {
    this.config.questions.forEach(q => {
      this.quizQuestions.push(new QuizQuestion(q.question, q.answers, q.img_url, q.video_url, q.countdown_seconds, q.score));
    });
    // this.shuffleQuestions();
  }

  private shuffleQuestions() {
    var currentIndex = this.quizQuestions.length;
    var temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      //TODO: Migliorare algoritmo per mischiare le domande
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.quizQuestions[currentIndex];
      this.quizQuestions[currentIndex] = this.quizQuestions[randomIndex];
      this.quizQuestions[randomIndex] = temporaryValue;
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
