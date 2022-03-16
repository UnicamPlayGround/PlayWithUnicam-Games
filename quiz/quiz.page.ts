import { Component, OnInit, Inject, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomController, ModalController } from '@ionic/angular';
import { Timer } from 'src/app/components/timer-components/timer';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { Router } from '@angular/router';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { LoginService } from 'src/app/services/login-service/login.service';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { QuizLogicService } from './services/quiz-logic.service';
import { GameLogic } from '../game-logic';
import { QuizQuestion } from './quiz-question';
import { ClassificaPage } from 'src/app/modal-pages/classifica/classifica.page';
import jwt_decode from 'jwt-decode';


@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage implements OnInit, OnDestroy {
  score: number = 0;
  questionsTotalNumber: number;
  questions: QuizQuestion[] = [];
  shuffledAnswers: string[] = [];
  answeredQuestions: QuizQuestion[] = [];
  activeQuestion: QuizQuestion;
  activeQuestionIndex: number;
  selectedAnswer: string;
  timerDomanda: Timer = new Timer(30, false, () => { this.setActiveQuestion(); });
  disableAnswers = false;
  toolbarColor: string = 'primary';
  amIDone: boolean = false;

  /**
   * stringa per mostare il tempo (formato 'min:sec')
   */
  display: String;

  backgrounds = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'medium'];

  private someoneHasWon = false;
  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };

  private timerInfoPartita;
  private timerPing;
  private timerClassifica;
  private workerTimer = new Worker(new URL('src/app/workers/timer-worker.worker', import.meta.url));

  /**
   * Variabile booleana per indicare se l'utente sta uscendo dalla pagina o no:
   * * **true** se l'utente sta uscendo dalla pagina
   * * **false** altrimenti
   */
  isLeavingPage: boolean;

  /**
   * Timer che viene avviato quando un giocatore vince
   */
  timerFinale: Timer = new Timer(null, false, () => {
    this.stopTimer();
    this.sendMatchData();
    this.showRanking();
  });

  /**
   * timer della partita (conteggio dei secondi della partita)
   */
  timerPartita;

  /**
   * tempo della partita in secondi
   */
  seconds = 0;

  /**
   * Classifica della partita
   */
  classifica: any[] = [];

  /**
  * Giocatore locale
  */
  localPlayer: string;

  constructor(
    private domCtrl: DomController,
    private renderer: Renderer2,
    private timerCtrl: TimerController,
    private lobbyManager: LobbyManagerService,
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private http: HttpClient,
    private errorManager: ErrorManagerService,
    private router: Router,
    private modalController: ModalController,
    private quizLogic: QuizLogicService) { }

  ngOnInit() {
    this.isLeavingPage = false;
    this.ping();
    this.loadInfoLobby();
    this.initializeTimers();

    this.getGameConfig()
      .then(_ => { return this.loadPlayers() })
      .then(_ => {
        this.setLocalPlayer();
        this.questions = this.quizLogic.getQuizQuestions();
        this.questionsTotalNumber = this.questions.length;
        this.setActiveQuestion();
        this.startTimer();
        this.timerFinale.setTimerTime(60);
        // this.timerDomanda.startTimer();
      });
  }

  ngOnDestroy() {
    this.quizLogic.reset();
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
      // console.log('secondi trascorsi:', this.seconds);
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
    const toSend = {
      'token': tokenValue,
      'info_giocatore': {
        "answered": (this.questionsTotalNumber - this.questions.length),
        "score": this.score,
        "time": this.seconds
      }
    }

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
          // console.log('info_partita', this.info_partita);

          this.info_partita.info.giocatori.forEach(p => {
            if (p.info_giocatore.answered == this.questionsTotalNumber) {
              if (p.username != this.localPlayer) {
                this.alertCreator.createAlert("Veloce!", p.username + " ha già finito il quiz per primo!", button, true);
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
    return this.quizLogic.initialize()
      .catch(errorRes => { this.handleError(errorRes, "File di configurazione mancante!"); });
  }

  loadPlayers(): Promise<void> {
    return this.quizLogic.updatePlayers()
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
          this.router.navigateByUrl(this.quizLogic.redirectPath, { replaceUrl: true });
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
    return this.quizLogic.ping()
      .catch(errorRes => { this.handleError(errorRes, "Ping fallito!"); });
  }

  //TODO commentare
  terminaPartita(): Promise<void> {
    return this.quizLogic.terminaPartita();
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
      this.router.navigateByUrl(this.quizLogic.redirectPath, { replaceUrl: true });
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
    this.localPlayer = decodedToken.username;
    this.sendMatchData();
  }

  /**
 * Ferma il timer della partita.
 */
  private stopTimer() {
    clearInterval(this.timerPartita);
  }

  /**
   * Controlla se l'utente ha indovinato tutte le carte oppure no.
   * In caso positivo, viene mostrato un alert di fine partita e, successivamente,
   * la classifica finale.
   */
  private checkEndMatch() {
    // var button = [{ text: 'Vai alla classifica', handler: () => { this.showRanking(); } }];
    var button = [{ text: 'Vedi classifica', handler: () => { } }];
    // var button = [{ text: 'Esci', handler: () => { this.leaveMatch() } }];
    if (this.answeredQuestions.length == this.questionsTotalNumber) {
      this.sendMatchData();
      this.terminaPartita();

      this.alertCreator.createAlert("Complimenti!", "Hai completato il quiz in " + this.display, button, false);
      this.amIDone = true;
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
    console.log('classifica', this.classifica);

    const modal = await this.modalController.create({
      component: ClassificaPage,
      componentProps: {
        classifica: this.classifica
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then(async () => {
      this.stopTimers();
      if (this.localPlayer == this.lobby.admin_lobby)
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      else
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
    });

    return await modal.present();
  }

  /**
   * Inserisce all'interno di una lista tutti i giocatori con il relativo punteggio.
   * * Se il giocatore non ha ancora completato il quiz avrà come punteggio "ancora in gioco".
   * @returns la lista ordinata ottenuta richiamando il metodo 'sortRanking'
   */
  private saveRanking() {
    this.classifica.splice(0, this.classifica.length);
    var toSave;
    this.info_partita.info.giocatori.forEach(p => {
      if (p.username == this.localPlayer)
        toSave = {
          "username": this.localPlayer,
          "answered": (this.questionsTotalNumber - this.questions.length),
          "time": this.seconds, "score": this.score
        };
      else {
        if (p.info_giocatore.answered == this.questionsTotalNumber)
          toSave = { "username": p.username, "answered": p.info_giocatore.answered, "time": p.info_giocatore.time, "score": p.info_giocatore.score }
        else
          toSave = { "username": p.username, "answered": p.info_giocatore.answered, "time": p.info_giocatore.time, "score": "ancora in gioco" }
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
      if (a.score == "ancora in gioco" || b.score == "ancora in gioco")
        return a.time;
      else {
        if (a.score == b.score)
          return a.time - b.time;
        else
          return b.score - a.score;
      }
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

  // /**
  //  * Ritorna la lista delle carte, prendendole dal service 'gameLogic'
  //  * @returns la lista delle carte utilizzate in partita
  //  */
  // getQuizQuestions() {
  //   return this.quizLogic.getQuizQuestions();
  // }

  /**
   * Chiede all'utente la conferma di abbandonare la partita
   */
  confirmLeaveMatch() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la partita?',
      async () => { this.leaveMatch(); });
  }



  // METODI GIOCO-------------------
  setActiveQuestion() {

    if (this.questions.length > 0) {
      this.selectedAnswer = null;
      this.disableAnswers = false;

      // PER SELEZIONARE LA DOMANDA RANDOMICAMENTE
      // this.activeQuestionIndex = Math.floor(Math.random() * this.questions.length);
      // this.activeQuestion = this.questions[this.activeQuestionIndex];

      // PER ANDARE IN ORDINE
      this.activeQuestion = this.questions.splice(0, 1)[0];

      this.setAnswers();
      this.shuffleAnswers();

      this.toolbarColor = this.backgrounds[Math.floor(Math.random() * this.backgrounds.length)];
      this.timerDomanda.setTimerTime(this.activeQuestion.countdownSeconds);
      this.timerDomanda.startTimer();
    }
  }

  /**
   * Inserisce le risposte di una determinata domanda all'interno dell'array 'shuffledAnswers'
   */
  setAnswers() {
    this.shuffledAnswers = [];
    for (let index = 0; index < this.activeQuestion.answers.length; index++) {
      this.shuffledAnswers.push(this.activeQuestion.answers[index]);
    }
  }

  /**
   * Mescola le domande da mostrare sulla modal
   */
  shuffleAnswers() {
    for (var i = this.shuffledAnswers.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = this.shuffledAnswers[i];
      this.shuffledAnswers[i] = this.shuffledAnswers[j];
      this.shuffledAnswers[j] = temp;
    }
  }

  selectAnswer(answer: string) {
    this.timerDomanda.stopTimer();
    this.selectedAnswer = answer;
    this.disableAnswers = true;

    if (this.selectedAnswer == this.activeQuestion.answers[0]) {
      this.score += this.activeQuestion.score;
    }

    // SE LA DOMANDA ERA STATA SELEZIONATA RANDOMICAMENTE
    // this.questions.splice(this.activeQuestionIndex, 1).forEach(q => {
    //   this.answeredQuestions.push(q);
    // });

    // SE LA DOMANDA ERA STATA PRESA IN ORDINE
    this.answeredQuestions.push(this.activeQuestion);

    this.sendMatchData();

    setTimeout(() => {
      if (this.questions.length > 0)
        this.setActiveQuestion();
      this.checkEndMatch();
    }, 3000);
  }

}