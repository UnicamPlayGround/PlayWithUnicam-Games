import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import jwt_decode from 'jwt-decode';
import { ModalController } from '@ionic/angular';
import { CellQuestionPage } from './modal/cell-question/cell-question.page';
import { ClassificaPage } from './modal/classifica/classifica.page';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { Router } from '@angular/router';
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
    private router: Router,
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

            if (lancio != 0)
              this.muoviPedina(player.goose, this.getPosizionePedina(player.goose), lancio);

            // var aggiornamento = setTimeout(() => {
            //   console.log('nel timeout');
            //   if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
            //      this.iniziaTurno();
            //   clearTimeout(aggiornamento);
            // }, 1200 * lancio);
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

  private async inviaDatiPartita(info, fineTurno) {
    const token_value = (await this.loginService.getToken()).value;

    const to_send = {
      'token': token_value,
      'info_giocatore': info
    }

    this.http.put('/game/save', to_send).subscribe(
      async (res) => {
        if (fineTurno)
          this.concludiTurno();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
      }
    );
  }

  async concludiTurno() {
    this.myTurn = false;

    const token_value = (await this.loginService.getToken()).value;

    const to_send = {
      'token': token_value
    }

    this.http.put('/game/fine-turno', to_send).subscribe(
      async (res) => {
        console.log("ASPETTA");
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
      }
    );
  }

  /**
   * Dopo lo spostamento della pedina, presenta una Modal in cui sarà contenuta una domanda.
   * Se l'utente risponde correttamente alla domanda, può continuare a lanciare il dado,
   * altrimenti il turno passa al prossimo avversario. 
   * @returns presenta la Modal.
   */
  async presentaDomanda() {
    const modal = await this.modalController.create({
      component: CellQuestionPage,
      componentProps: {
        question: this.cells[this.getPosizionePedina(this.gamePlayers[this.localPlayerIndex].goose)].question
      },
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then((data) => {
      const mod_user = data['data'];

      if (mod_user) {
        this.inviaDatiPartita(this.gamePlayers[this.localPlayerIndex].info, false);
        this.iniziaTurno();
      } else
        this.inviaDatiPartita(this.gamePlayers[this.localPlayerIndex].info, true);
    });
    return await modal.present();
  }

  private calcolaClassifica() {
    var classifica = [];
    var numeroCaselle = 15;
    this.gamePlayers.forEach(player => {
      var posizione = 0;
      player.info.forEach(lancio => {
        posizione += lancio;

        if (posizione > numeroCaselle) {
          var dif = posizione - numeroCaselle;
          posizione = numeroCaselle - dif;
        }
      });

      var toSave = {
        "username": player.username,
        "posizione": posizione
      }

      classifica.push(toSave);
    });

    return this.ordinaClassifica(classifica);
  }

  private ordinaClassifica(classifica) {
    classifica.sort(function (a, b) {
      return b.posizione - a.posizione;
    });
    return classifica;
  }

  async mostraClassifica() {
    const modal = await this.modalController.create({
      component: ClassificaPage,
      componentProps: {
        classifica: this.calcolaClassifica()
      },
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then((data) => {
      this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
    });
    return await modal.present();
  }

  private cercaGiocatoreByGoose(goose) {
    return this.gamePlayers.filter(giocatore => {
      if (giocatore.goose == goose)
        return giocatore;
    })[0];
  }

  private controllaFinePartita(posizione, lancio, goose, intervalloMovimentoPedina) {
    if (posizione == 14 && lancio == 1) {
      this.inviaDatiPartita(this.gamePlayers[this.localPlayerIndex].info, true);

      var button = [{ text: 'Vai alla classifica', handler: () => { this.mostraClassifica(); } }];
      if (goose == this.gamePlayers[this.localPlayerIndex].goose)
        this.alertCreator.createAlert("Vittoria", "Complimenti, hai vinto la partita!", button);
      else {
        const vincitore = this.cercaGiocatoreByGoose(goose);
        this.alertCreator.createAlert("Peccato!", vincitore.username + " ha vinto!", button);
      }

      clearInterval(intervalloMovimentoPedina);
    }
  }

  muoviPedina(goose, posizione, lancio) {
    const intervalloMovimentoPedina = setInterval(() => {
      if (lancio == 0) {
        console.log("il lancio è = 0");
        clearInterval(intervalloMovimentoPedina);

        if (goose == this.gamePlayers[this.localPlayerIndex].goose)
          this.presentaDomanda();

        if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
          this.iniziaTurno();

      } else {
        console.log("intervallo");
        //TODO da rigaurdare
        if (this.controllaDirezionePedina(posizione, lancio)) {
          this.controllaFinePartita(posizione, lancio, goose, intervalloMovimentoPedina);
          document.getElementById('c' + (++posizione)).appendChild(document.getElementById(goose));
          lancio--;
        } else {
          if (lancio > 1) {
            clearInterval(intervalloMovimentoPedina);
            document.getElementById('c' + (--posizione)).appendChild(document.getElementById(goose));
            this.tornaIndietro(goose, posizione, --lancio);
            if (goose == this.gamePlayers[this.localPlayerIndex].goose)
              this.presentaDomanda();

          } else if (lancio == 1) {
            clearInterval(intervalloMovimentoPedina);
            document.getElementById('c' + (--posizione)).appendChild(document.getElementById(goose));
            if (goose == this.gamePlayers[this.localPlayerIndex].goose)
              this.presentaDomanda();
          }
        }
      }
    }, 700);
  }

  /**
   * Controlla se una Pedina deve andare avanti o indietro.
   * @param posizione Posizione attuale della Pedina
   * @param lancio Valore ottenuto dal lancio del dado
   * @returns true se la Pedina può continuare ad andare avanti, false altrimenti.
   */
  controllaDirezionePedina(posizione, lancio) {
    if (posizione == 15 && lancio >= 1)
      return false;
    else
      return true;
  }

  tornaIndietro(goose, posizione, lancio) {
    const interval = setInterval(() => {
      if (lancio == 0) {
        clearInterval(interval);

        if (goose == this.gamePlayers[this.localPlayerIndex].goose)
          this.presentaDomanda();

        if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
          this.iniziaTurno();

        return;
      }

      document.getElementById('c' + (--posizione)).appendChild(document.getElementById(goose));
      lancio--;
    }, 600);
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