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
    { title: 'START' },
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

  /**
   * Recupera i partecipanti della lobby.
   * La prima volta che viene fatto, vengono inizializzati i giocatori tramite il
   * metodo setGamePlayers().
   */
  async loadPlayers() {
    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.lobbyPlayers = res['results'];
        if (this.gamePlayers.length == 0) this.setGamePlayers();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giocatori!');
      });
  }

  /**
   * Inizializza i giocatori inserendoli nell'array "gamePlayers" ed assegnando ad ognuno una pedina.
   * Viene salvato l'indice del giocatore locale nella variabile "localPlayerIndex". 
   */
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
    this.getInfoPartita();
  }

  /**
   * Recupera i dati della partita corrente //TODO
   */
  async getInfoPartita() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'][0];
        console.log('this.info_partita:', this.info_partita);

        if (this.info_partita && this.info_partita.info)
          await this.aggiornaMosseAvversari();
        else if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
          this.iniziaTurno();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

  async aggiornaMosseAvversari() {
    var mosseAggiornate = [];

    this.info_partita.info.giocatori.forEach(p => {
      if (p.username != this.gamePlayers[this.localPlayerIndex].username) {
        mosseAggiornate = p.info_giocatore;

        this.gamePlayers.forEach(player => {
          if (player.username == p.username) {
            const differenza = mosseAggiornate.length - player.info.length;
            var lancio = 0;

            for (let i = (mosseAggiornate.length - differenza); i < mosseAggiornate.length; i++) {
              console.log(player.username + ' ha fatto ' + mosseAggiornate[i]);
              player.info.push(mosseAggiornate[i]);
              lancio += mosseAggiornate[i];
            }
            this.muoviPedina(player.goose, this.getPosizionePedina(player.goose), lancio);

            var aggiornamento = setTimeout(() => {
              console.log('nel timeout');
              if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
                this.iniziaTurno();
              clearTimeout(aggiornamento);
            }, 1000 * lancio);
          }
        });
        mosseAggiornate = [];
      }
    });
  }

  /**
   * Recupera l'id della casella in cui si trova la pedina e ne ritorna il numero.
   * 
   * @param goose L'id della pedina di cui si vuole conoscere la posizione.
   * @returns Il numero della casella dove si trova la pedina.
   */
  getPosizionePedina(goose) {
    var cellId = document.getElementById(goose).parentElement.id;
    return parseInt(cellId.substr(1));
  }

  async ping() {
    console.log("ping...");
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
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
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
      }
    );
  }

  //TODO finire dopo che Rossi risponde
  async presentaDomanda() {
    const modal = await this.modalController.create({
      component: CellQuestionPage,
      componentProps: {
        question: this.cells[this.getPosizionePedina(this.gamePlayers[this.localPlayerIndex].goose)].question
      },
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then((data) => {
      // const mod_user = data['data'];
      // console.log('mod_user', mod_user);

      // if (mod_user)
      //   this.users[index] = mod_user;
    });

    return await modal.present();
  }

  muoviPedina(goose, posizione, lancio) {
    const interval = setInterval(() => {
      if (lancio == 0) {
        clearInterval(interval);

        //this.presentaDomanda();

        if (goose == this.gamePlayers[this.localPlayerIndex].goose)
          this.concludiTurno(this.gamePlayers[this.localPlayerIndex].info);
        return;
      }

      document.getElementById('c' + (++posizione)).appendChild(document.getElementById(goose));
      lancio--;
    }, 700);
  }


  //TODO da eliminare
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

    this.muoviPedina(this.gamePlayers[this.localPlayerIndex].goose, this.getPosizionePedina(this.gamePlayers[this.localPlayerIndex].goose), lancio);
  }
}