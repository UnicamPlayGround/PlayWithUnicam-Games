import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ClassificaPage } from 'src/app/modal-pages/classifica/classifica.page';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { HttpClient } from '@angular/common/http';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { MemoryCard } from '../memory-card';
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
export class MemoryMultiGamePage implements OnInit, OnDestroy {

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
  timerFinale: Timer = new Timer(10, false, () => {
    this.stopTimer();
    this.sendMatchData();
    this.showRanking();
  });
  /**
   * Classifica della partita
   */
  classifica: any[] = [];

  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };

  private timerInfoPartita;
  private timerPing;
  private timerClassifica;

  selectedCards: MemoryCard[] = [];

  constructor(
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private http: HttpClient,
    private errorManager: ErrorManagerService,
    private gameLogic: GameLogicService,
    private modalController: ModalController,
    private timerService: TimerController,
    private router: Router,
    private lobbyManager: LobbyManagerService
  ) { }

  async ngOnInit() {
    this.gameLogic.ping();
    this.loadInfoLobby();
    this.timerInfoPartita = this.timerService.getTimer(() => { this.getInfoPartita() }, 2000);
    this.timerPing = this.timerService.getTimer(() => { this.gameLogic.ping() }, 4000);
    this.timerClassifica = this.timerService.getTimer(() => { this.calculateRanking() }, 2000);

    this.gameLogic.initialize()
      .then(_ => {
        this.setLocalPlayer();
        this.startTimer();
      })
  }

  ngOnDestroy() {
    this.gameLogic.reset();
    this.timerService.stopTimers(this.timerInfoPartita, this.timerPing, this.timerClassifica);
  }

  /**
   * Prende il giocatore locale tramite il token e imposta la variabile 'localPlayer'.
   */
  private async setLocalPlayer() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    this.gameLogic.players.forEach(player => {
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
    return this.gameLogic.getCards()
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
    const minutes: number = Math.floor(value / 60);
    return minutes + ':' + (value - minutes * 60);
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
    if (card.enabled && this.gameLogic.flippableCards && !this.selectedCards.includes(card)) {
      if (this.selectedCards.length < 2) {
        card.memory_card.revealCard();
        this.selectedCards.push(card);
      }

      if (this.selectedCards.length == 2) {
        this.gameLogic.flippableCards = false;

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
      this.gameLogic.flippableCards = true;
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
      this.gameLogic.flippableCards = true;
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
    if (this.localPlayer.guessedCards.length == (this.gameLogic.memoryCards.length / 2)) {
      this.sendMatchData();
      this.gameLogic.terminaPartita();

      this.alertCreator.createAlert("Fine partita!", "Complimenti, hai indovinato tutte le carte in " + this.display, button);
      this.timerService.stopTimers(this.timerInfoPartita);
      this.stopTimer();
      this.timerFinale.enabled = false;
    }
  }

  /**
   * Carica le informazioni della lobby.
   */
  private async loadInfoLobby() {
    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
      },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  /**
   * Effettua la chiamata REST per aggiornare il database con le informazioni passate in input.
   */
  private async sendMatchData() {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue, 'info_giocatore': { "guessed_cards": this.localPlayer.guessedCards.length, "time": this.seconds } }

    this.http.put('/game/save', toSend).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Invio dati partita fallito');
      }
    )
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
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then(async () => {
      this.timerService.stopTimers(this.timerInfoPartita, this.timerPing);
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
        toSave = { "username": this.localPlayer.nickname, "guessed_cards": this.localPlayer.guessedCards.length, "time": this.seconds, "punteggio": this.transform(this.seconds) }
      else {
        if (p.info_giocatore.guessed_cards == (this.gameLogic.memoryCards.length / 2))
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
   * Calcolare la classifica in modo dinamico.
   */
  private calculateRanking() {
    setTimeout(async () => {
      const token_value = (await this.loginService.getToken()).value;
      const headers = { 'token': token_value };

      this.http.get('/game/status', { headers }).subscribe(
        async (res) => {
          this.info_partita = res['results'];
          this.saveRanking();
        },
        async (res) => {
          this.timerService.stopTimers(this.timerInfoPartita, this.timerPing);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          this.errorManager.stampaErrore(res, 'Recupero informazioni partita fallito!');
        }
      );
    }, 2000);
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
   * Effettua la chiamata REST per ottenere le informazioni della partita di tutti i giocatori.
   */
  private async getInfoPartita() {
    var button = [{ text: 'Continua a giocare' }];
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'];

        this.info_partita.info.giocatori.forEach(p => {
          if (p.info_giocatore.guessed_cards == (this.gameLogic.memoryCards.length / 2)) {
            if (p.username != this.localPlayer.nickname) {
              this.alertCreator.createAlert("PECCATO!", p.username + " ha vinto la partita", button);
              this.timerService.stopTimers(this.timerInfoPartita);
              this.timerFinale.startTimer();
            }
          }
        });
      },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoPartita, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Recupero informazioni partita fallito!');
      }
    );
  }

  /**
   * Chiede all'utente la conferma di abbandonare la partita
   */
  confirmLeaveMatch() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la partita?',
      async () => { this.leaveMatch(); })
  }

  /**
   * Fa uscire il giocatore dalla partita.
   */
  private leaveMatch() {
    this.timerService.stopTimers(this.timerPing, this.timerInfoPartita);
    return new Promise<void>(async (resolve, reject) => {
      (await this.lobbyManager.abbandonaLobby()).subscribe(
        async (res) => {
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          return resolve();
        },
        async (res) => {
          this.timerPing = this.timerService.getTimer(() => { this.gameLogic.ping() }, 4000);
          this.errorManager.stampaErrore(res, 'Abbandono fallito');
          return reject('Abbandono fallito');
        }
      );
    })
  }

}