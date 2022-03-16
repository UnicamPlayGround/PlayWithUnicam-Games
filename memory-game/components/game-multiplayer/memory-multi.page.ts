import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ClassificaPage } from 'src/app/modal-pages/classifica/classifica.page';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { GameLogic } from 'src/app/PlayWithUnicam-Games/game-logic';
import { HttpClient } from '@angular/common/http';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { MemoryCard } from '../memory-card';
import { MemoryGameLogicService } from '../../services/game-logic/memory-game-logic.service';
import { MemoryPlayer } from '../memory-player';
import { ModalController } from '@ionic/angular';
import { QuestionModalPage } from 'src/app/modal-pages/question-modal/question-modal.page';
import { Router } from '@angular/router';
import { Timer } from 'src/app/components/timer-components/timer';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-memory-multi',
  templateUrl: './memory-multi.page.html',
  styleUrls: ['./memory-multi.page.scss'],
})
export class MemoryMultiGamePage implements OnInit, OnDestroy, GameLogic {
  /**
   * tempo della partita in secondi
   */
  seconds = 0;
  /**
   * stringa per mostare il tempo (formato 'min:sec')
   */
  display: String;
  /**
   * timer della partita (conteggio dei secondi della partita)
   */
  timerPartita;
  /**
   * Giocatore locale
   */
  localPlayer: MemoryPlayer;
  /**
   * Timer che viene avviato quando un giocatore vince
   */
  timerFinale: Timer = new Timer(null, false, () => {
    this.stopTimer();
    this.sendMatchData();
    this.showRanking();
  });
  /**
   * Classifica della partita
   */
  classifica: any[] = [];

  private someoneHasWon = false;

  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };

  private timerInfoPartita;
  private timerPing;
  private timerClassifica;
  private workerTimer = new Worker(new URL('src/app/workers/timer-worker.worker', import.meta.url));

  selectedCards: MemoryCard[] = [];

  /**
   * Variabile booleana per indicare se l'utente sta uscendo dalla pagina o no:
   * * **true** se l'utente sta uscendo dalla pagina
   * * **false** altrimenti
   */
  isLeavingPage: boolean;

  constructor(
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private http: HttpClient,
    private errorManager: ErrorManagerService,
    private memoryGameLogic: MemoryGameLogicService,
    private modalController: ModalController,
    private timerCtrl: TimerController,
    private router: Router,
    private lobbyManager: LobbyManagerService
  ) { }

  async ngOnInit() {
    this.isLeavingPage = false;
    this.ping();
    this.loadInfoLobby();
    this.initializeTimers();

    this.getGameConfig()
      .then(_ => { return this.loadPlayers() })
      .then(_ => {
        this.setLocalPlayer();
        this.startTimer();
        this.timerFinale.setTimerTime(this.memoryGameLogic.config.end_countdown);
      });
  }

  ngOnDestroy() {
    this.memoryGameLogic.reset();
    this.stopTimers();
    this.timerFinale.stopTimer();
    this.isLeavingPage = true;
  }

  /**
 * Fa partire il timer del gioco.
 */
  startTimer() {
    this.timerPartita = setInterval(() => {
      this.seconds++;
      this.display = this.transform(this.seconds);
    }, 1000);
  }

  /**
   * Trasforma il contatore dei secondi passati in input.
   * Esso ritornerà infatti il tempo seguendo il formato:
   * * *"minuti:secondi"* *
   * @param value la stringa relativa al conteggio passato in input
   * @returns la stringa del tempo in formato 'min:sec'
   */
  private transform(value) {
    var minutes = Math.floor(value / 60);
    var seconds = value - (minutes * 60);
    var minString: string;
    var secString: string;

    if (minutes < 10) minString = "0" + minutes;
    else minString = "" + minutes;

    if (seconds < 10) secString = "0" + seconds;
    else secString = "" + seconds;

    return minString + ":" + secString;
  }

  /**
   * Inizializza i timer della pagina.
   */
  private initializeTimers() {
    if (typeof Worker !== 'undefined') {
      this.workerTimer.onmessage = () => {
        this.ping();
        this.calculateRanking();
        this.getInfoPartita();
      };
      this.workerTimer.postMessage(2000);
    } else {
      // Gli Web Worker non sono supportati.
      this.timerInfoPartita = this.timerCtrl.getTimer(() => { this.getInfoPartita() }, 2000);
      this.timerPing = this.timerCtrl.getTimer(() => { this.ping() }, 4000);
      this.timerClassifica = this.timerCtrl.getTimer(() => { this.calculateRanking() }, 2000);
    }
  }

  /**
   * Ferma i timer della pagina
   */
  private stopTimers() {
    this.workerTimer.terminate();
    this.timerCtrl.stopTimers(this.timerClassifica, this.timerInfoPartita, this.timerPing);
  }

  /**
   * ------------------------------ CHIAMATE REST ------------------------------
   */

  /**
   * Carica le informazioni della lobby.
   */
  async loadInfoLobby() {
    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
      },
      async (res) => { this.handleError(res, 'Impossibile caricare la lobby!'); });
  }

  /**
   * Effettua la chiamata REST per aggiornare il database con le informazioni passate in input.
   */
  async sendMatchData() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue, 'info_giocatore': { "guessed_cards": this.localPlayer.guessedCards.length, "time": this.seconds } }

    this.http.put('/game/save', toSend).subscribe(
      async (res) => { },
      async (res) => { this.handleError(res, 'Invio dati partita fallito'); }
    )
  }

  /**
   * Calcolare la classifica in modo dinamico.
   */
  private async calculateRanking() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'];
        this.saveRanking();
      },
      async (res) => { this.handleError(res, 'Recupero informazioni partita fallito!'); }
    );
  }

  /**
   * Effettua la chiamata REST per ottenere le informazioni della partita di tutti i giocatori.
   */
  async getInfoPartita() {
    if (!this.someoneHasWon) {
      var button = [{ text: 'Continua a giocare' }];
      const token_value = (await this.loginService.getToken()).value;
      const headers = { 'token': token_value };

      this.http.get('/game/status', { headers }).subscribe(
        async (res) => {
          this.info_partita = res['results'];

          this.info_partita.info.giocatori.forEach(p => {
            if (p.info_giocatore.guessed_cards == (this.memoryGameLogic.memoryCards.length / 2)) {
              if (p.username != this.localPlayer.nickname) {
                this.alertCreator.createAlert("Peccato!", p.username + " ha vinto la partita", button, true);
                this.someoneHasWon = true;
                this.timerFinale.startTimer();
              }
            }
          });
        },
        async (res) => { this.handleError(res, 'Recupero informazioni partita fallito!'); }
      );
    }
  }

  //TODO commentare
  getGameConfig(): Promise<void> {
    return this.memoryGameLogic.initialize()
      .catch(errorRes => { this.handleError(errorRes, "File di configurazione mancante!"); });
  }

  loadPlayers(): Promise<void> {
    return this.memoryGameLogic.updatePlayers()
      .catch(errorRes => { this.handleError(errorRes, "Impossibile caricare i giocatori!"); });
  }

  /**
   * Fa uscire il giocatore dalla partita.
   */
  leaveMatch() {
    this.stopTimers();
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.abbandonaLobby()).subscribe(
        async (res) => {
          this.router.navigateByUrl(this.memoryGameLogic.redirectPath, { replaceUrl: true });
          return resolve();
        },
        async (res) => {
          this.timerPing = this.timerCtrl.getTimer(() => { this.ping() }, 4000);
          this.errorManager.stampaErrore(res, 'Abbandono fallito');
          return reject('Abbandono fallito');
        }
      );
    })
  }

  /**
   * Effettua l'operazione di ping.
   */
  ping(): Promise<void> {
    return this.memoryGameLogic.ping()
      .catch(errorRes => { this.handleError(errorRes, "Ping fallito!"); });
  }

  //TODO commentare
  terminaPartita(): Promise<void> {
    return this.memoryGameLogic.terminaPartita();
  }

  /**
   * Gestisce un errore causato da una chiamata REST e crea un alert 
   * solo se l'utente non sta abbandonando la pagina. 
   * @param res Response della chiamata REST
   * @param errorText Header dell'alert
   */
  handleError(res, errorText: string) {
    if (!this.isLeavingPage) {
      this.stopTimers();
      this.router.navigateByUrl(this.memoryGameLogic.redirectPath, { replaceUrl: true });
      this.errorManager.stampaErrore(res, errorText);
      this.isLeavingPage = true;
    }
  }

  /**
   * Prende il giocatore locale tramite il token e imposta la variabile 'localPlayer'.
   */
  private async setLocalPlayer() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    this.memoryGameLogic.players.forEach(player => {
      if (player.nickname == decodedToken.username)
        this.localPlayer = new MemoryPlayer(decodedToken.username);
    });
    this.sendMatchData();
  }

  /**
   * Ritorna la lista delle carte, prendendole dal service 'gameLogic'
   * @returns la lista delle carte utilizzate in partita
   */
  getCards() {
    return this.memoryGameLogic.getCards()
  }

  /**
   * Ferma il timer della partita.
   */
  private stopTimer() {
    clearInterval(this.timerPartita);
  }

  /**
   * Esegue l'animazione per coprire e scoprire le carte quando vengono premute.
   * @param card la carta con cui l'utente ha interagito
   */
  selectCard(card: MemoryCard) {
    if (card.enabled && this.memoryGameLogic.flippableCards && !this.selectedCards.includes(card)) {
      if (this.selectedCards.length < 2) {
        card.memory_card.revealCard();
        this.selectedCards.push(card);
      }

      if (this.selectedCards.length == 2) {
        this.memoryGameLogic.flippableCards = false;

        setTimeout(() => {
          this.compareCards();
        }, 1000);
      }
    }
  }

  /**
   * Confronta le due carte selezionate dall'utente.
   * Se sono uguali viene richiamato il metodo per controllare se la partita è terminata,
   * altrimenti le carte selezionate vengono rigirate.
   */
  private compareCards() {
    if (this.selectedCards[0].title == this.selectedCards[1].title) {

      this.showQuestion(this.selectedCards[0]);

      this.selectedCards[0].enabled = false;
      this.selectedCards[1].enabled = false;
    }
    else {
      this.selectedCards[0].memory_card.coverCard();
      this.selectedCards[1].memory_card.coverCard();

      this.selectedCards[0].enabled = true;
      this.selectedCards[1].enabled = true;

      this.selectedCards = [];
      this.memoryGameLogic.flippableCards = true;
    }
  }

  /**
   * Presenta la domanda relativa alla coppia di carte indovinata.
   * Se l'utente risponde correttamente alla domanda, verrà informato il server e verrà controllato se la partita è terminata.
   * Altrimenti le carte verranno ricoperte.
   * @param card la carta da cui prendere la domanda
   */
  private async showQuestion(card: MemoryCard) {
    const modal = await this.modalController.create({
      component: QuestionModalPage,
      componentProps: {
        question: card.question,
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const correctAnswer = data['data'];

      if (correctAnswer) {
        this.localPlayer.guessedCards.push(this.selectedCards[0]);

        this.sendMatchData();
        this.checkEndMatch();
        this.selectedCards = [];
      }
      else {
        this.coverSelectedCards();
      }
      this.memoryGameLogic.flippableCards = true;
    });

    await modal.present();
  }

  /**
   * Copre le carte selezionate poichè non sono uguali e imposta le relativi variabili 'enabled' uguale a true.
   */
  private coverSelectedCards() {
    this.selectedCards[0].enabled = true;
    this.selectedCards[1].enabled = true;

    this.selectedCards[0].memory_card.coverCard();
    this.selectedCards[1].memory_card.coverCard();
    this.selectedCards = [];
  }

  /**
   * Controlla se l'utente ha indovinato tutte le carte oppure no.
   * In caso positivo, viene mostrato un alert di fine partita e, successivamente,
   * la classifica finale.
   */
  private checkEndMatch() {
    var button = [{ text: 'Vai alla classifica', handler: () => { this.showRanking(); } }];
    if (this.localPlayer.guessedCards.length == (this.memoryGameLogic.memoryCards.length / 2)) {
      this.sendMatchData();
      this.terminaPartita();

      this.alertCreator.createAlert("Fine partita!", "Complimenti, hai indovinato tutte le carte in " + this.display, button, false);
      this.someoneHasWon = true;
      this.stopTimer();
      this.timerFinale.enabled = false;
    }
  }

  /**
   * Mostra la classifica finale della partita.
   * @returns presenta la modal
   */
  private async showRanking() {
    this.saveRanking();
    const modal = await this.modalController.create({
      component: ClassificaPage,
      componentProps: {
        classifica: this.classifica
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then(async () => {
      this.stopTimers();
      if (this.localPlayer.nickname == this.lobby.admin_lobby)
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      else
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
    });

    return await modal.present();
  }

  /**
   * Inserisce all'interno di una lista tutti i giocatori con il relativo punteggio.
   * * Se il giocatore non ha ancora completato il memory avrà come punteggio "ancora in gioco".
   * @returns la lista ordinata ottenuta richiamando il metodo 'sortRanking'
   */
  private saveRanking() {
    this.classifica.splice(0, this.classifica.length);
    var toSave;
    this.info_partita.info.giocatori.forEach(p => {
      if (p.username == this.localPlayer.nickname)
        toSave = {
          "username": this.localPlayer.nickname,
          "guessed_cards": this.localPlayer.guessedCards.length,
          "time": this.seconds,
          "punteggio": this.transform(this.seconds)
        }
      else {
        if (p.info_giocatore.guessed_cards == (this.memoryGameLogic.memoryCards.length / 2))
          toSave = { "username": p.username, "guessed_cards": p.info_giocatore.guessed_cards, "time": p.info_giocatore.time, "punteggio": this.transform(p.info_giocatore.time) }
        else
          toSave = { "username": p.username, "guessed_cards": p.info_giocatore.guessed_cards, "time": p.info_giocatore.time, "punteggio": "ancora in gioco" }
      }
      this.classifica.push(toSave);
    });
    this.sortRanking();
    this.updateScore();
  }

  /**
   * Ordina la classifica.
   */
  private sortRanking() {
    this.classifica.sort(function (a, b) {
      if (a.guessed_cards == b.guessed_cards)
        return a.time - b.time;
      else
        return b.guessed_cards - a.guessed_cards;
    });
  }

  /**
   * Quando il Timer finale arriva a 0 aggiorna il punteggio dei giocatori che non hanno indovinato tutte le carte,
   * passando da *"ancora in gioco"* al tempo del 
   * giocatore che ha vinto più il tempo del Timer finale.
   */
  private updateScore() {
    var tempoVittoria = this.classifica[0].time;

    this.classifica.forEach(giocatore => {
      if (giocatore.time >= (tempoVittoria + this.timerFinale.getTimerTime()) - 1)
        giocatore.punteggio = this.transform(giocatore.time);
    });
  }

  /**
   * Chiede all'utente la conferma di abbandonare la partita
   */
  confirmLeaveMatch() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la partita?',
      async () => { this.leaveMatch(); });
  }

}