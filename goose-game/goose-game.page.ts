import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ClassificaPage } from '../../modal-pages/classifica/classifica.page';
import { Component, OnInit } from '@angular/core';
import { DadiPage } from 'src/app/modal-pages/dadi/dadi.page';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ModalController } from '@ionic/angular';
import { QuestionModalPage } from 'src/app/modal-pages/question-modal/question-modal.page';
import { Router } from '@angular/router';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { ToastCreatorService } from 'src/app/services/toast-creator/toast-creator.service';
import { TurnBasedGame } from '../turn-based-game';
import { UiBuilderService } from './services/game-builder/ui-builder.service';
import jwt_decode from 'jwt-decode';
import { GooseGameCell } from './components/goose-game-cell';
import { Question } from 'src/app/modal-pages/question-modal/question';

@Component({
  selector: 'app-goose-game',
  templateUrl: './goose-game.page.html',
  styleUrls: ['./goose-game.page.scss'],
})
export class GooseGamePage implements OnInit, TurnBasedGame {

  cells: GooseGameCell[] = [];
  lobbyPlayers = [];
  gamePlayers = [];
  localPlayerIndex;

  myTurn = false;
  abilitaDado = false;
  fineAggiornamento = true;
  alertFineDomande = true;

  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };

  /**
   * Array contenente le domande che il giocatore locale deve ancora fare.
   */
  domandeDisponibili: GooseGameCell[] = [];

  private timerGiocatori;
  private timerPing;
  private timerInfoPartita;

  constructor(
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private modalController: ModalController,
    private lobbyManager: LobbyManagerService,
    private timerService: TimerController,
    private errorManager: ErrorManagerService,
    private toastCreator: ToastCreatorService,
    private router: Router,
    private http: HttpClient,
    private uiBuilder: UiBuilderService
  ) { }

  async ngOnInit() {
    this.getGameConfig();
    this.ping();
    this.loadInfoLobby()
    this.timerGiocatori = this.timerService.getTimer(() => { this.loadPlayers() }, 3000);
    this.timerInfoPartita = this.timerService.getTimer(() => { this.getInfoPartita() }, 2000);
    this.timerPing = this.timerService.getTimer(() => { this.ping() }, 4000);
  }

  /**
   * ------------------------------ CHIAMATE REST ------------------------------
   */

  /**
   * Richiede al Server il JSON di configurazione del Gioco, necessario per la costruzione
   * del tabellone.
   */
  async getGameConfig() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    return new Promise<void>((resolve, reject) => {
      this.http.get('/game/config', { headers }).subscribe(
        async (res) => {
          res['results'][0].config.cells.forEach(cell => {
            if (cell.question)
              this.cells.push(new GooseGameCell(cell.title, new Question(cell.question.q, cell.question.answers, cell.question.img_url, cell.question.video_url, cell.question.countdown_seconds)));
            else
              this.cells.push(new GooseGameCell(cell.title));
          });
          this.uiBuilder.createGameBoard(this.cells);
          this.setQuestionsAvailable();
          this.loadPlayers();
          return resolve();
        },
        async (res) => {
          this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'File di configurazione mancante');
          return reject("File di configurazione mancante");
        }
      );
    })
  }

  /**
   * Recupera i dati della partita corrente.
   * * Se il Giocatore Corrente corrisponde al Giocatore locale allora viene eseguito il
   *   metodo *"iniziaTurno()"*.
   */
  async getInfoPartita() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'];

        if (this.info_partita && this.info_partita.info) {
          if (this.gamePlayers.length == 1 && this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
            this.iniziaTurno();
          else await this.aggiornaMosseAvversari();

        } else if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
          this.iniziaTurno();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Recupero informazioni partita fallito!');
      }
    );
  }

  /**
   * Invia al Server lo storico dei risultati dei lanci del dado relativi al Giocatore locale.
   * Inoltre se *"fineTurno"* è true conclude il turno del Giocatore.
   * @param info Informazioni da salvare
   */
  async sendMatchData(info: JSON) {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue, 'info_giocatore': info }

    return new Promise<void>((resolve, reject) => {
      this.http.put('/game/save', toSend).subscribe(
        async (res) => { return resolve(); },
        async (res) => {
          this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
          return reject('Invio dati partita fallito');
        }
      );
    })
  }

  /**
   * Conclude il turno del Giocatore locale.
   */
  async concludiTurno() {
    this.myTurn = false;
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    return new Promise<void>((resolve, reject) => {
      this.http.put('/game/fine-turno', toSend).subscribe(
        async (res) => { return resolve(); },
        async (res) => {
          this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
          return reject('Invio dati partita fallito');
        }
      );
    })
  }

  /**
   * Fa terminare la partita e ferma gli opportuni timers.
   */
  async terminaPartita() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    return new Promise<void>((resolve, reject) => {
      this.http.put('/partita/termina', toSend).subscribe(
        async (res) => {
          this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita);
          return resolve();
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Terminazione partita fallita');
          return reject('Terminazione partita fallita');
        });
    })
  }

  /**
   * Carica le Informazioni della Lobby.
   */
  loadInfoLobby() {
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.loadInfoLobby()).subscribe(
        async (res) => {
          this.lobby = res['results'][0];
          return resolve();
        },
        async (res) => {
          this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
          return reject('Impossibile caricare la lobby!');
        });
    })
  }

  /**
   * Recupera i partecipanti della lobby.
   * La prima volta che viene fatto, vengono inizializzati i giocatori tramite il
   * metodo setGamePlayers().
   */
  loadPlayers() {
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.getPartecipanti()).subscribe(
        async (res) => {
          this.lobbyPlayers = res['results'];
          if (this.gamePlayers.length == 0) this.setGamePlayers();
          if (this.gamePlayers.length > this.lobbyPlayers.length) this.rimuoviGiocatore();
          return resolve();
        },
        async (res) => {
          this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'Impossibile caricare i giocatori!');
          return reject('Impossibile caricare i giocatori!');
        });
    })
  }

  /**
   * Effettua l'operazione di ping richiamando il metodo opportuno.
   */
  ping() {
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.ping()).subscribe(
        async (res) => { return resolve(); },
        async (res) => {
          this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'Ping fallito');
          return reject('Ping fallito');
        }
      );
    })
  }

  /**
   * Fa abbandonare la partita ad un giocatore.
   */
  leaveMatch() {
    this.timerService.stopTimers(this.timerPing, this.timerGiocatori, this.timerInfoPartita);
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.abbandonaLobby()).subscribe(
        async (res) => {
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          return resolve();
        },
        async (res) => {
          this.timerPing = this.timerService.getTimer(() => { this.ping() }, 4000);
          this.errorManager.stampaErrore(res, 'Abbandono fallito');
          return reject('Abbandono fallito');
        }
      );
    })
  }

  /**
   * Riempe l'array delle domande disponibili.
   */
  setQuestionsAvailable() {
    this.domandeDisponibili = this.domandeDisponibili.concat(this.cells);
    this.domandeDisponibili.shift();
    this.domandeDisponibili.pop();
  }

  /**
   * Controlla se un giocatore abbandona la partita.
   * In quel caso verrà rimossa la pedina relativa al giocatore.
   */
  rimuoviGiocatore() {
    var localUsernames = this.gamePlayers.map(p => { return p.username });
    var updatedUsernames = this.lobbyPlayers.map(p => { return p.username });
    var missingPlayers = localUsernames.filter(player => !updatedUsernames.includes(player));

    missingPlayers.forEach(username => {
      this.toastCreator.creaToast(username + " ha abbandonato la partita.", "top", 3500);

      this.gamePlayers.forEach(p => {
        if (p.username == username) {
          var toRemove = document.getElementById(p.goose);
          toRemove.parentNode.removeChild(toRemove);
        }
      });

      this.gamePlayers = this.gamePlayers.filter((p) => {
        return p.username !== username;
      });
    });
    this.setLocalPlayerIndex();
  }

  /**
   * Inizializza i giocatori inserendoli nell'array "gamePlayers" ed assegnando ad ognuno una pedina.
   * Viene salvato l'indice del giocatore locale nella variabile "localPlayerIndex". 
   */
  async setGamePlayers() {
    var counter = 1;
    this.lobbyPlayers.forEach(player => {
      const tmp = { 'username': player.username, 'goose': "goose" + counter, 'info': [] }
      this.gamePlayers.push(tmp);
      counter++;
    });
    this.setLocalPlayerIndex();
    this.uiBuilder.createPlayersGoose(this.gamePlayers);
    this.getInfoPartita();
  }

  /**
   * Scorre l'array 'gamePlayers' e salva l'indice della posizione del giocatore locale
   * nella variabile 'localPlayerIndex'.
   */
  async setLocalPlayerIndex() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    this.localPlayerIndex = this.gamePlayers.map(p => p.username).indexOf(decodedToken.username);
  }

  /**
   * Controlla che lo storico dei movimenti delle pedine in locale
   * corrisponda a quello salvato sul Server.
   * In caso contrario aggiorna la posizione delle pedine avversarie 
   * secondo le informazioni recuperate dal Server.
   */
  async aggiornaMosseAvversari() {
    var mosseAggiornate = [];

    this.info_partita.info.giocatori.forEach(p => {
      if (p.username != this.gamePlayers[this.localPlayerIndex].username) {
        mosseAggiornate = p.info_giocatore;

        this.gamePlayers.forEach(player => {
          if (player.username == p.username) {
            const differenza = mosseAggiornate.length - player.info.length;

            if (differenza > 0) {
              for (let i = (mosseAggiornate.length - differenza); i < mosseAggiornate.length; i++) {
                player.info.push(mosseAggiornate[i]);
                if (mosseAggiornate[i] != 0) {
                  this.toastCreator.creaToast(this.getToastMessage(player.username, mosseAggiornate[i]), "top", 3500);
                  this.muoviPedina(player.goose, mosseAggiornate[i]);
                }
              }
            } else {
              if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn && this.fineAggiornamento)
                this.iniziaTurno();
            }
          }
        });
        mosseAggiornate = [];
      }
    });
  }

  /**
   * Ritorna il messaggio del toast.
   * @param player Giocatore che ha lanciato il dado
   * @param lancio Lancio del dado
   * @returns il messaggio del toast
   */
  getToastMessage(player, lancio) {
    return player + " ha lanciato il dado ed è uscito " + lancio + "!";
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

  /**
   * Fa iniziare il turno ad un giocatore. 
   * Viene mostrato un Alert che comunica l'inizio del turno e viene abilitato il bottone per il lancio del dato.
   * Inoltre la variabile *"myTurn"* viene impostata a true.
   */
  iniziaTurno() {
    this.alertCreator.createInfoAlert('Tocca a te!', 'È il tuo turno, tira il dado per procedere!');
    this.myTurn = true;
    this.abilitaDado = true;
  }

  /**
   * Elimina la domanda appena effettuata dal giocatore locale.
   * @param numeroCasella Numero della casella corrispondente alla domanda
   */
  private eliminaDomanda(numeroCasella) {
    var index = this.domandeDisponibili.findIndex((casella) => { return casella.title == numeroCasella });
    this.domandeDisponibili.splice(index, 1);
  }

  /**
   * Dopo lo spostamento della pedina, presenta una Modal in cui sarà contenuta una domanda.
   * Se l'utente risponde correttamente alla domanda, può continuare a lanciare il dado,
   * altrimenti il turno passa al prossimo avversario. 
   * 
   * Se l'utente ha già risposto alla domanda di una casella,
   * gli verrà presentata la domanda di una casella in cui non è stato, 
   * questo finché l'utente non ha risposto a tutte le domande.
   * @returns presenta la Modal.
   */
  async presentaDomanda() {
    const numeroCasella: number = parseInt(this.cells[this.getPosizionePedina(this.gamePlayers[this.localPlayerIndex].goose)].title);

    if (this.domandeDisponibili.length > 0) {
      if (this.domandeDisponibili.includes(this.cells[numeroCasella])) {
        this.creaModalDomanda(this.cells[this.getPosizionePedina(this.gamePlayers[this.localPlayerIndex].goose)]);
        this.eliminaDomanda(numeroCasella);
      } else {
        this.creaModalDomanda(this.domandeDisponibili[0]);
        this.domandeDisponibili.splice(0, 1);
      }
    } else {
      if (this.alertFineDomande) {
        this.alertCreator.createInfoAlert('Complimenti', "Hai risposto a tutte le domande, attendi che finisca il turno l'avversario!");
        this.alertFineDomande = false;
      }
      this.sendMatchData(this.gamePlayers[this.localPlayerIndex].info)
        .then(_ => { this.concludiTurno(); });
    }
  }

  /**
   * Crea la Modal per presentare la domanda.
   * @param cell Casella dove si trova la pedina del giocatore
   */
  private async creaModalDomanda(cell: GooseGameCell) {
    const modal = await this.modalController.create({
      component: QuestionModalPage,
      componentProps: {
        question: cell.question
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const rispostaCorretta = data['data'];

      if (rispostaCorretta)
        this.iniziaTurno();
      else
        this.sendMatchData(this.gamePlayers[this.localPlayerIndex].info)
          .then(_ => { this.concludiTurno(); });
    });

    await modal.present();
  }

  /**
   * Salva all'interno dell'array "classifica" l'username di tutti i giocatori e la posizione della relativa pedina.
   * Il metodo ritornerà la classifica finale ordinata chiamando l'opportuno metodo.
   */
  private calcolaClassifica() {
    var classifica = [];
    var numeroCaselle = this.cells.length - 1;
    this.gamePlayers.forEach(player => {
      var posizione = 0;
      player.info.forEach(lancio => {
        posizione += lancio;

        if (posizione > numeroCaselle) {
          var dif = posizione - numeroCaselle;
          posizione = numeroCaselle - dif;
        }
      });

      var toSave = { "username": player.username, "punteggio": posizione }
      classifica.push(toSave);
    });
    return this.ordinaClassifica(classifica);
  }

  /**
   * Ordina la classifica passata in input in base alla posizione delle pedine.
   * @param classifica array contenente username e posizione di tutti i giocatori della partita
   * @returns la classifica ordinata
   */
  private ordinaClassifica(classifica) {
    classifica.sort(function (a, b) {
      return b.posizione - a.posizione;
    });
    return classifica;
  }

  /**
   * Mostra la modal contenente la classifica finale.
   * @returns presenta la modal
   */
  async mostraClassifica() {
    const modal = await this.modalController.create({
      component: ClassificaPage,
      componentProps: {
        classifica: this.calcolaClassifica()
      },
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then(async () => {
      this.timerService.stopTimers(this.timerPing);
      if (this.gamePlayers[this.localPlayerIndex].username == this.lobby.admin_lobby)
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      else
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
    });

    return await modal.present();
  }

  /**
   * Controlla se esiste un giocatore con la stessa pedina passata in input.
   * Se esiste, ritorna il giocatore.
   * @param goose la pedina del giocatore
   * @returns il giocatore
   */
  private cercaGiocatoreByGoose(goose) {
    return this.gamePlayers.filter(giocatore => {
      if (giocatore.goose == goose)
        return giocatore;
    })[0];
  }

  /**
   * Controlla se la partita è terminata oppure no.
   * Quindi controlla se la pedina passata in input si è fermata nell'ultima posizione oppure no.
   * In caso affermativo, la partita verrà terminata richiamando il metodo opportuno e verrà mostrato a video
   * un alert che comunicherà la vittoria
   * @param posizione posizione della pedina
   * @param goose la pedina
   * @returns true se la partita è terminata, false altrimenti.
   */
  private controllaFinePartita(posizione, goose) {
    if (posizione == (this.cells.length - 1)) {
      var button = [{ text: 'Vai alla classifica', handler: () => { this.mostraClassifica(); } }];

      if (goose == this.gamePlayers[this.localPlayerIndex].goose) {
        this.sendMatchData(this.gamePlayers[this.localPlayerIndex].info);
        this.terminaPartita();
        this.alertCreator.createAlert("Vittoria", "Complimenti, hai vinto la partita!", button);
      } else {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita);
        const vincitore = this.cercaGiocatoreByGoose(goose);
        this.alertCreator.createAlert("Peccato!", vincitore.username + " ha vinto!", button);
      }

      return true;
    } else return false;
  }

  /**
   * Fa spostare la pedina desiderata in base al lancio passato in input ed 
   * effettua gli opportuni controlli per verificare se la partita è terminata oppure no.
   * Al termine di ogni lancio, viene mostrata la domanda relativa alla casella di destinazione.
   * Il metodo inoltre si occupa di gestire i turni degli utenti.
   * @param goose la pedina da muovere
   * @param lancio lo spostamento della pedina
   */
  muoviPedina(goose, lancio) {
    var direzione = true;

    if (goose != this.gamePlayers[this.localPlayerIndex].goose)
      this.fineAggiornamento = false;

    const intervalloMovimentoPedina = setInterval(() => {
      var posizione = this.getPosizionePedina(goose);

      if (lancio == 0) {
        clearInterval(intervalloMovimentoPedina);
        this.fineAggiornamento = true;

        if (!this.controllaFinePartita(posizione, goose)) {
          if (goose == this.gamePlayers[this.localPlayerIndex].goose) {
            this.sendMatchData(this.gamePlayers[this.localPlayerIndex].info);
            if (posizione != 0)
              this.presentaDomanda();
            else
              this.sendMatchData(this.gamePlayers[this.localPlayerIndex].info)
                .then(_ => { this.concludiTurno(); });
          }

          if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
            this.iniziaTurno();
        }
      } else {
        if (posizione == (this.cells.length - 1)) direzione = false;

        this.effettuaSpostamento(goose, posizione, direzione);
        lancio--;
      }
    }, 600);
  }

  /**
   * Fa muovere la pedina di una casella in base alla direzione passata in input.
   * @param goose la pedina da muovere
   * @param posizione la posizione iniziale della pedina
   * @param direzione la direzione verso cui si deve muovere la pedina
   */
  effettuaSpostamento(goose, posizione, direzione) {
    if (direzione)
      document.getElementById('c' + (++posizione)).appendChild(document.getElementById(goose));
    else if (posizione > 0)
      document.getElementById('c' + (--posizione)).appendChild(document.getElementById(goose));
  }

  /**
   * Apre la modal dove sarà visualizzato il lancio del dado.
   * Una volta terminata l'animazione verrà effettuato lo spostamento della pedina richiamando il metodo opportuno
   * @returns presenta la modal
   */
  async lanciaDado() {
    this.abilitaDado = false;

    const modal = await this.modalController.create({
      component: DadiPage,
      componentProps: {
        nDadi: 1
      },
      cssClass: 'die-roll-modal'
    });

    modal.onDidDismiss().then((data) => {
      const lancio = data['data'];
      if (lancio) {
        this.toastCreator.creaToast("Hai totalizzato " + lancio + "!", "top", 3500);
        this.gamePlayers[this.localPlayerIndex].info.push(lancio);
        this.muoviPedina(this.gamePlayers[this.localPlayerIndex].goose, lancio);
      }
    });

    return await modal.present();
  }

  /**
   * Apre un alert per confermare l'abbandono della partita.
   * 
   * Prima di effettuare l'abbandono della partita viene controllato se il giocatore che vuole
   * abbandonare è il *giocatore corrente*, in caso positivo viene concluso il suo turno.
   */
  confermaAbbandonoPartita() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la partita?',
      async () => {
        if (this.myTurn)
          this.concludiTurno()
            .then(_ => { this.leaveMatch(); });
        else
          this.leaveMatch();
      })
  }
}