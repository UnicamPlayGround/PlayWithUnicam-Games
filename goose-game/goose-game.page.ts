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
  players = [];
  local_player;
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
    this.getInfoPartita();
    this.ping();
    this.timerGiocatori = timerService.getTimer(() => { this.loadPlayers() }, 15000);
    this.timerInfoPartita = timerService.getTimer(() => { this.getInfoPartita() }, 3000);
    this.timerPing = timerService.getTimer(() => { this.ping() }, 4000);
  }

  async ngOnInit() {
    // TODO
    const token = (await this.loginService.getToken()).value;
    const decoded_token: any = jwt_decode(token);
    this.local_player = decoded_token.username;

  }

  async loadPlayers() {
    //TODO
    console.log("sto caricando i giocatori...");

    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.players = res['results'];
        console.log(this.players);
      },
      async (res) => {
        this.timerService.stopTimer(this.timerGiocatori);
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giocatori!');
      });
  }

  async getInfoPartita() {
    //TODO
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'][0];
        console.log('this.info_partita:', this.info_partita);

        if (this.info_partita.giocatore_corrente == this.local_player && !this.myTurn) {
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
    this.alertCreator.createInfoAlert('Tempo scaduto!', 'Il tuo turno è terminato, attendi che gli altri giocatori completino il proprio!');
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

  muoviPedina(direzione) {
    console.log(direzione);
    var step = 170;
    switch (direzione) {
      case "down":
        var x = document.getElementById('goose1').offsetTop + step;
        document.getElementById('goose1').style.top = x + "px";
        break;
      case "up":
        var x = document.getElementById('goose1').offsetTop - step;
        document.getElementById('goose1').style.top = x + "px";
        break;
      case "left":
        var y = document.getElementById('goose1').offsetLeft - step;
        document.getElementById('goose1').style.left = y + "px";
        document.getElementById('goose1').style.transform = "scaleX(+1)";
        break;
      case "right":
        var y = document.getElementById('goose1').offsetLeft + step;
        document.getElementById('goose1').style.left = y + "px";
        document.getElementById('goose1').style.transform = "scaleX(-1)";
        break;
    }
    this.posizione++;

    if (this.posizione == 15) {
      this.alertCreator.createInfoAlert("Fine partita", "pippo ha vinto!");
    }
  }

  lanciaDado() {
    var lancio = Math.floor(Math.random() * 6) + 1;
    const toSend = lancio;
    console.log("lancio " + lancio);
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

        this.concludiTurno(toSend);
        return;
      }

      if (this.posizione >= 7 && this.posizione < 9)
        this.muoviPedina('down');
      else if (this.posizione >= 9)
        this.muoviPedina('left');
      else this.muoviPedina('right');
      lancio--;
    }, 700);
  }
}