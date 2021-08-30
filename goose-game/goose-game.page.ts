import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import jwt_decode from 'jwt-decode';
import { ModalController } from '@ionic/angular';
import { CellQuestionPage } from './modal/cell-question/cell-question.page';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-goose-game',
  templateUrl: './goose-game.page.html',
  styleUrls: ['./goose-game.page.scss'],
})
export class GooseGamePage implements OnInit {
  // partecipanti della lobby (solo username)
  lobbyPlayers = [];
  // giocatori { username, goose, info}
  gamePlayers = [];
  // me stesso { username, goose }
  localPlayerIndex;
  // true se è il mio turno, false altrimenti
  myTurn = false;
  cells = [
    { title: '1', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '2', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '3', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '4', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '5', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '6', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '7', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '8', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '9', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '10', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '11', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '12', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '13', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '14', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    { title: '15', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
  ];

  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };

  posizione = 1;

  private timerGiocatori;
  private timerPing;
  private timerInfoPartita;

  constructor(
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private modalController: ModalController,
    private lobbyManager: LobbyManagerService,
    private timerService: TimerServiceService,
    private errorManager: ErrorManagerService,
    private http: HttpClient) {
    this.loadPlayers();
    this.ping();
    this.timerGiocatori = timerService.getTimer(() => { this.loadPlayers() }, 15000);
    this.timerInfoPartita = timerService.getTimer(() => { this.getInfoPartita() }, 3000);
    this.timerPing = timerService.getTimer(() => { this.ping() }, 4000);
  }

  async ngOnInit() { }


  async loadPlayers() {
    //TODO
    console.log("sto caricando i giocatori...");

    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.lobbyPlayers = res['results'];
        console.log(this.lobbyPlayers);

        if (this.gamePlayers.length == 0) this.setGamePlayers();
      },
      async (res) => {
        this.timerService.stopTimer(this.timerGiocatori);
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giocatori!');
      });
  }

  async setGamePlayers() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);

    var counter = 1;
    this.lobbyPlayers.forEach(player => {
      const tmp = { 'username': player.username, 'goose': "goose" + counter, 'info': [] }

      if (tmp.username == decodedToken.username)
        this.localPlayerIndex = this.gamePlayers.length;

      this.gamePlayers.push(tmp);
      counter++;
    });

    console.log('this.gamePlayers:', this.gamePlayers);
    this.getInfoPartita();
  }

  async getInfoPartita() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'][0];
        console.log('this.info_partita:', this.info_partita);

        if (this.info_partita.info) {
          var mosseAggiornate = [];

          this.info_partita.info.giocatori.forEach(p => {
            if (p.username != this.gamePlayers[this.localPlayerIndex].username) {
              mosseAggiornate = p.info_giocatore;

              console.log('mosseAggiornate:', mosseAggiornate);

              this.gamePlayers.forEach(player => {
                if (player.username != this.gamePlayers[this.localPlayerIndex].username) {
                  const differenza = mosseAggiornate.length - player.info.length;
                  console.log('differenza:', differenza);

                  for (let i = (mosseAggiornate.length - differenza); i < mosseAggiornate.length; i++) {
                    player.info.push(mosseAggiornate[i]);

                    var posizione = 0;

                    for (let k = 0; k < i; k++) {
                      posizione += mosseAggiornate[k];
                    }


                    this.muoviPedina(player.goose, posizione, mosseAggiornate[i]);
                  }
                }
              });
              mosseAggiornate = [];
            }
          });
        }

        if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn) {
          this.iniziaTurno();
        }
      },
      async (res) => {
        //TODO stoppare anche l'altro timer
        this.timerService.stopTimer(this.timerPing);
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

  async ping() {
    console.log("ping...");
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
        //TODO stoppare anche l'altro timer
        this.timerService.stopTimer(this.timerPing);
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

  iniziaTurno() {
    this.alertCreator.createInfoAlert('Tocca a te!', 'È il tuo turno, tira il dado per procedere!');
    this.myTurn = true;
  }

  async concludiTurno(info) {
    this.myTurn = false;

    const token_value = (await this.loginService.getToken()).value;

    const to_send = {
      'token': token_value,
      'info_giocatore': info
    }

    this.http.put('/game/save', to_send).subscribe(
      async (res) => {
        console.log("ASPETTA");
      },
      async (res) => {
        //TODO stoppare anche l'altro timer
        this.timerService.stopTimer(this.timerPing);
        this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
      }
    );
  }

  //TODO finire dopo che Rossi risponde
  async presentaDomanda() {
    const modal = await this.modalController.create({
      component: CellQuestionPage,
      componentProps: {
        question: this.cells[this.posizione].question
      },
      cssClass: 'fullheight'
    });

    // modal.onDidDismiss().then((data) => {
    //   const mod_user = data['data'];
    //   console.log('mod_user', mod_user);

    //   if (mod_user)
    //     this.users[index] = mod_user;
    // });

    return await modal.present();
  }

  muoviPedina(goose, posizione, lancio) {
    const interval = setInterval(() => {
      if (lancio == 0) {
        clearInterval(interval);
        return;
      }

      if (posizione >= 7 && posizione < 9)
        this.effettuaSpostamento(goose, 'down');
      else if (posizione >= 9)
        this.effettuaSpostamento(goose, 'left');
      else this.effettuaSpostamento(goose, 'right');
      lancio--;
    }, 700);
  }

  effettuaSpostamento(goose, direzione) {
    console.log(direzione);
    var step = 170;
    switch (direzione) {
      case "down":
        var x = document.getElementById(goose).offsetTop + step;
        document.getElementById(goose).style.top = x + "px";
        break;
      case "up":
        var x = document.getElementById(goose).offsetTop - step;
        document.getElementById(goose).style.top = x + "px";
        break;
      case "left":
        var y = document.getElementById(goose).offsetLeft - step;
        document.getElementById(goose).style.left = y + "px";
        document.getElementById(goose).style.transform = "scaleX(+1)";
        break;
      case "right":
        var y = document.getElementById(goose).offsetLeft + step;
        document.getElementById(goose).style.left = y + "px";
        document.getElementById(goose).style.transform = "scaleX(-1)";
        break;
    }
  }

  lanciaDado() {
    var lancio = Math.floor(Math.random() * 6) + 1;

    this.gamePlayers[this.localPlayerIndex].info.push(lancio);

    var immagineDado = <HTMLInputElement>document.getElementById("cubo");
    immagineDado.removeAttribute("class");
    immagineDado.classList.add("rollDice");
    immagineDado.classList.add("mostra" + lancio);

    //TODO rivedere la posizione degli assets
    immagineDado.classList.add("mostra" + lancio);

    setTimeout(function () {
      immagineDado.classList.remove("rollDice");
    }, 1500);

    const interval = setInterval(() => {
      if (lancio == 0) {
        clearInterval(interval);
        //TODO
        //this.presentaDomanda();

        this.concludiTurno(this.gamePlayers[this.localPlayerIndex].info);
        return;
      }

      if (this.posizione >= 7 && this.posizione < 9)
        this.effettuaSpostamento(this.gamePlayers[this.localPlayerIndex].goose, 'down');
      else if (this.posizione >= 9)
        this.effettuaSpostamento(this.gamePlayers[this.localPlayerIndex].goose, 'left');
      else this.effettuaSpostamento(this.gamePlayers[this.localPlayerIndex].goose, 'right');
      lancio--;
    }, 700);
  }
}