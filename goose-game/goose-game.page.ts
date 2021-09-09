import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import jwt_decode from 'jwt-decode';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { CellQuestionPage } from './modal/cell-question/cell-question.page';
import { ClassificaPage } from '../../modal-pages/classifica/classifica.page';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { Router } from '@angular/router';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { DadiPage } from 'src/app/modal-pages/dadi/dadi.page';

@Component({
  selector: 'app-goose-game',
  templateUrl: './goose-game.page.html',
  styleUrls: ['./goose-game.page.scss'],
})
export class GooseGamePage implements OnInit {
  cells = [];
  lobbyPlayers = [];
  gamePlayers = [];
  localPlayerIndex;
  myTurn = false;
  abilitaDado = false;
  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };

  private timerGiocatori;
  private timerPing;
  private timerInfoPartita;

  constructor(
    private alertCreator: AlertCreatorService,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private modalController: ModalController,
    private lobbyManager: LobbyManagerService,
    private timerService: TimerServiceService,
    private errorManager: ErrorManagerService,
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient
  ) {
    this.getGameConfig();
    this.loadPlayers();
    this.ping();
    this.loadInfoLobby()
    this.timerGiocatori = timerService.getTimer(() => { this.loadPlayers() }, 3000);
    this.timerInfoPartita = timerService.getTimer(() => { this.getInfoPartita() }, 1000);
    this.timerPing = timerService.getTimer(() => { this.ping() }, 4000);
  }

  async ngOnInit() { }

  async getGameConfig() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/config', { headers }).subscribe(
      async (res) => {
        this.cells = res['results'][0].config.cells;
        this.createGameBoard();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'File di configurazione mancante');
      }
    );
  }

  /**
   * Costruisce le pedine dei vari giocatori che partecipano
   * alla partita. 
   */
  createPlayersGoose() {
    this.gamePlayers.forEach(player => {
      const goose = document.createElement("div");
      goose.id = player.goose;
      goose.title = player.username;
      goose.classList.add("goose");
      goose.classList.add(player.goose);
      goose.appendChild(this.getGooseName(player.username));
      goose.appendChild(this.getGooseImg(player.goose));
      document.getElementById("c0").appendChild(goose);
    });
  }

  /**
   * Crea e ritorna un elemento <p> il cui testo è dato dal
   * valore di 'username'.
   * @param username Il testo da scrivere dentro il <p>.
   * @returns L'elemento <p> creato.
   */
  getGooseName(username) {
    const name = document.createElement("p");
    name.textContent = username;
    return name;
  }

  /**
   * Crea e ritorna un elemento <img> la cui 'src' è data dal
   * file il cui basename è il valore di 'goose'.
   * 
   * @param goose Il basename dell'immagine da aprire.
   * @returns L'elemento <img> creato.
   */
  getGooseImg(goose) {
    const img = document.createElement("img");
    img.src = "game-assets/goose-game/game-assets/" + goose + ".png";
    return img;
  }

  /**
   * Costruisce il tabellone di gioco in base alle caselle contenute in 'this.cells'.
   */
  createGameBoard() {
    var currentRowNumber = 0;
    var direction = true;

    this.cells.forEach(cell => {
      const newCell = this.createGameCell(cell.title);
      const currentRow = document.getElementById("row" + currentRowNumber);

      if (currentRow.childNodes.length < 8) {
        if (currentRowNumber % 2 == 0) this.appendChildByDirection(currentRow, newCell, direction);
        else {
          this.fillRowWithEmptyCells(currentRow, direction);
          this.createNewRow(++currentRowNumber).appendChild(newCell);
        }
      } else {
        direction = !direction;
        this.createNewRow(++currentRowNumber).appendChild(newCell);
      }
    });

    if (document.getElementById("row" + currentRowNumber).childNodes.length < 8) {
      this.fillRowWithEmptyCells(document.getElementById("row" + currentRowNumber), direction);
    }
  }

  /**
   * Crea una nuova riga del tabellone e la ritorna.
   * 
   * @param currentRowNumber Il numero della nuova riga da creare.
   * @returns La nuova riga creata.
   */
  createNewRow(currentRowNumber) {
    const newRow = document.createElement("tr");
    newRow.id = "row" + currentRowNumber;
    newRow.classList.add("row");
    document.getElementById("table").appendChild(newRow);
    return newRow;
  }

  /**
   * Crea una nuova casella di gioco con all'interno una label contentente il numero della casella.
   * 
   * @param cellNumber Il numero della casella da creare.
   * @returns La nuova casella creata.
   */
  createGameCell(cellNumber) {
    const newCell = document.createElement("td");
    newCell.id = "c" + cellNumber;
    newCell.classList.add("game-cell");
    const label = document.createElement("ion-label");
    label.textContent = cellNumber;
    newCell.appendChild(label);
    return newCell;
  }

  /**
   * Crea una nuova casella vuota (invisibile).
   * 
   * @returns La casella vuota creata.
   */
  createEmptyCell() {
    const emptyCell = document.createElement("td");
    emptyCell.classList.add("empty-cell");
    return emptyCell;
  }

  /**
   * Aggiunge il nodo 'child' come figlio del nodo 'parent' a seconda del valore
   * di 'direction': se è true aggiunge in coda, altrimenti aggiunge all'inizio.
   * 
   * @param parent Il container dentro cui aggiungere il nuovo nodo.
   * @param child Il nuovo nodo da aggiungere dentro il nodo container.
   * @param direction Determina dove aggiungere il nuovo nodo.
   */
  appendChildByDirection(parent, child, direction) {
    if (direction) parent.appendChild(child);
    else parent.insertBefore(child, parent.firstChild);
  }

  /**
   * Aggiunge alla riga passata in input tante caselle vuote quante necessarie
   * affinché la riga contenga un totale di 8 caselle.
   * Se 'direction' è true le aggiunge in coda, altrimenti le aggiunge all'inizio.
   * 
   * @param currentRow La riga a cui aggiungere caselle vuote.
   * @param direction Il verso di aggiunta delle caselle vuote.
   */
  fillRowWithEmptyCells(currentRow, direction) {
    const nToAdd = 8 - currentRow.childNodes.length;

    for (let i = 0; i < nToAdd; i++)
      this.appendChildByDirection(currentRow, this.createEmptyCell(), direction);
  }

  /**
   * Carica le Informazioni della Lobby.
   */
  private async loadInfoLobby() {
    const tokenValue = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(tokenValue);

    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

  /**
   * Recupera i partecipanti della lobby.
   * La prima volta che viene fatto, vengono inizializzati i giocatori tramite il
   * metodo setGamePlayers().
   */
  async loadPlayers() {
    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.lobbyPlayers = res['results'];
        console.log("LOBBY PLAYERS: ", this.lobbyPlayers);
        if (this.gamePlayers.length == 0) this.setGamePlayers();
        if (this.gamePlayers.length > this.lobbyPlayers.length) this.rimuoviGiocatore();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giocatori!');
      });
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
      this.presentToast(username + " ha abbandonato la partita.");

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
    this.createPlayersGoose();
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

        if (this.info_partita && this.info_partita.info)
          await this.aggiornaMosseAvversari();
        else if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
          this.iniziaTurno();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Recupero Informazioni Partita Fallito!');
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

            if (differenza > 0) {
              for (let i = (mosseAggiornate.length - differenza); i < mosseAggiornate.length; i++) {
                player.info.push(mosseAggiornate[i]);
                if (mosseAggiornate[i] != 0) {
                  this.presentToast(this.getToastMessage(player.username, mosseAggiornate[i], i));
                  this.muoviPedina(player.goose, mosseAggiornate[i]);
                }
              }
            } else {
              if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
                this.iniziaTurno();
            }
          }
        });
        mosseAggiornate = [];
      }
    });
  }

  getToastMessage(player, lancio, nMossa) {
    //TODO
    // if (nMossa == 0)
    return player + " ha lanciato il dado ed è uscito " + lancio + "!";
    // else return player + " ha risposto correttamente alla domanda, quindi ha ritirato il dado ed è uscito " + lancio + "!";
  }

  /**
   * Mostra il toas con il messaggio passato in input
   * @param message messaggio che deve essere mostrato nel toast
   */
  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      position: 'top',
      cssClass: 'toast',
      duration: 4500
    });
    await toast.present();
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
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

  /**
   * Fa iniziare il turno ad un giocatore. 
   * Viene mostrato un Alert che comunica l'inizio del turno e viene abilitato il bottone per il lancio del dato.
   * Inoltre la variabile "myTurn" viene impostata a true
   */
  iniziaTurno() {
    this.alertCreator.createInfoAlert('Tocca a te!', 'È il tuo turno, tira il dado per procedere!');
    this.myTurn = true;
    this.abilitaDado = !this.abilitaDado;
  }

  private async inviaDatiPartita(info, fineTurno) {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue, 'info_giocatore': info }

    this.http.put('/game/save', toSend).subscribe(
      async (res) => {
        if (fineTurno)
          this.concludiTurno();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
      }
    );
  }

  async concludiTurno() {
    this.myTurn = false;
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    this.http.put('/game/fine-turno', toSend).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
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
      const rispostaCorretta = data['data'];

      if (rispostaCorretta) {
        this.iniziaTurno();
      } else
        this.inviaDatiPartita(this.gamePlayers[this.localPlayerIndex].info, true);
    });
    return await modal.present();
  }

  /**
   * Calcola e ritorna la classifica finale della partita.
   * Per ogni giocatore, nella classifica verrà salvata la posizione della sua pedina nel tabellone.
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

      var toSave = { "username": player.username, "posizione": posizione }
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

    modal.onDidDismiss().then(async () => {
      this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
      if (this.gamePlayers[this.localPlayerIndex].username == this.lobby.admin_lobby)
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      else
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

  private async terminaPartita() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue }

    this.http.put('/partita/termina', toSend).subscribe(
      async (res) => {
        this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Terminazione Partita Fallita');
      });
  }

  private controllaFinePartita(posizione, goose) {
    if (posizione == (this.cells.length - 1)) {
      var button = [{ text: 'Vai alla classifica', handler: () => { this.mostraClassifica(); } }];

      if (goose == this.gamePlayers[this.localPlayerIndex].goose) {
        this.inviaDatiPartita(this.gamePlayers[this.localPlayerIndex].info, false);
        this.terminaPartita();
        this.alertCreator.createAlert("Vittoria", "Complimenti, hai vinto la partita!", button);
      } else {
        const vincitore = this.cercaGiocatoreByGoose(goose);
        this.alertCreator.createAlert("Peccato!", vincitore.username + " ha vinto!", button);
      }

      return true;
    } else return false;
  }

  muoviPedina(goose, lancio) {
    var direzione = true;

    const intervalloMovimentoPedina = setInterval(() => {
      var posizione = this.getPosizionePedina(goose);

      if (lancio == 0) {
        clearInterval(intervalloMovimentoPedina);

        if (!this.controllaFinePartita(posizione, goose)) {
          if (goose == this.gamePlayers[this.localPlayerIndex].goose) {
            this.inviaDatiPartita(this.gamePlayers[this.localPlayerIndex].info, false);
            this.presentaDomanda();
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

  effettuaSpostamento(goose, posizione, direzione) {
    if (direzione)
      document.getElementById('c' + (++posizione)).appendChild(document.getElementById(goose));
    else
      document.getElementById('c' + (--posizione)).appendChild(document.getElementById(goose));
  }

  async lanciaDado() {
    this.abilitaDado = !this.abilitaDado;

    const modal = await this.modalController.create({
      component: DadiPage,
      componentProps: {
        nDadi: 1
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const lancio = data['data'];

      if (lancio) {
        this.gamePlayers[this.localPlayerIndex].info.push(lancio);
        this.muoviPedina(this.gamePlayers[this.localPlayerIndex].goose, lancio);
      }
    });

    return await modal.present();
  }
}