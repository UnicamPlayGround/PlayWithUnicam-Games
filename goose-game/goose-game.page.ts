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

  abilitaDado = false;
  cells = [
    { title: '0' },
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
    // { title: '16', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '17', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '18', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '19', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '20', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '21', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '22', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '23', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '24', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '25', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '26', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '27', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '28', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '29', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '30', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '31', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '32', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '33', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '34', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '35', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '36', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '37', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '38', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } },
    // { title: '39', question: { q: 'Che ora è?', a1: 'le 3', a2: 'le 4', a3: 'le 5' } }
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

  async ngOnInit() {
    console.log('this.lobbyPlayers', this.lobbyPlayers);
    console.log('this.gamePlayers', this.gamePlayers);
    this.createGameBoard();
    //this.createPlayersGoose();
  }

  /**
   * Costruisce le pedine dei vari giocatori che partecipano
   * alla partita. 
   */
  createPlayersGoose() {
    console.log("sono dentro createGoose");
    this.gamePlayers.forEach(player => {
      console.log('player', player);
      const goose = document.createElement("div");
      goose.id = player.goose;
      goose.title = player.username;
      goose.classList.add("goose");
      goose.classList.add(player.goose);
      goose.appendChild(this.getGooseName(player.username));
      goose.appendChild(this.getGooseImg(player.goose));
      document.getElementById("c0").appendChild(goose);
      console.log(goose);
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
    console.log('name', name);
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
    img.src = "../../../assets/game-assets/" + goose + ".png";
    console.log('img', img);
    return img;
  }

  /**
   * Costruisce il tabellone di gioco in base alle caselle contenute in 'this.cells'.
   */
  createGameBoard() {
    console.log("sono dentro createGameBoard");
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
    this.abilitaDado = !this.abilitaDado;
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
    if (posizione == (this.cells.length - 2) && lancio == 1) {
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
        clearInterval(intervalloMovimentoPedina);

        if (goose == this.gamePlayers[this.localPlayerIndex].goose)
          this.presentaDomanda();

        if (this.info_partita.giocatore_corrente == this.gamePlayers[this.localPlayerIndex].username && !this.myTurn)
          this.iniziaTurno();

      } else {

        if (this.controllaDirezionePedina(posizione, lancio)) {
          this.controllaFinePartita(posizione, lancio, goose, intervalloMovimentoPedina);
          document.getElementById('c' + (++posizione)).appendChild(document.getElementById(goose));
          lancio--;
        } else {
          if (lancio > 1) {
            clearInterval(intervalloMovimentoPedina);
            document.getElementById('c' + (--posizione)).appendChild(document.getElementById(goose));
            this.tornaIndietro(goose, posizione, --lancio);

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
    if (posizione == (this.cells.length - 1) && lancio >= 1)
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
    this.abilitaDado = !this.abilitaDado;
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