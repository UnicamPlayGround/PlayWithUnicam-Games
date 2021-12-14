import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { HttpClient } from '@angular/common/http';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { MemoryCard } from '../memory-card';
import { ModalController } from '@ionic/angular';
import { ClassificaPage } from 'src/app/modal-pages/classifica/classifica.page';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { Router } from '@angular/router';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { MemoryPlayer } from '../memory-player';
import jwt_decode from 'jwt-decode';


@Component({
  selector: 'app-memory-multi',
  templateUrl: './memory-multi.page.html',
  styleUrls: ['./memory-multi.page.scss'],
})
export class MemoryMultiGamePage implements OnInit {

  time = 0;
  display;
  interval;

  localPlayer: MemoryPlayer;

  info_partita = { codice: null, codice_lobby: null, giocatore_corrente: null, id_gioco: null, info: null, vincitore: null };
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };

  private timerInfoPartita;

  selectedCards = [];

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

    this.gameLogic.initialization()
      .then(_ => {
        this.setLocalPlayer();
        this.startTimer();
      })
  }

  /**
   * Prende il giocatore locale tramite il token e imposta la variabile 'localPlayer'.
   */
  private async setLocalPlayer() {
    let localPlayerUsername : String;
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    localPlayerUsername = decodedToken.username;
    this.gameLogic.players.forEach(player => {
      if (player.nickname == decodedToken.username) this.localPlayer = new MemoryPlayer(decodedToken.username);
    });
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
    this.interval = setInterval(() => {
      if (this.time === 0) {
        this.time++;
      } else {
        this.time++;
      }
      this.display = this.transform(this.time);
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
   * Ferma il timer
   */
  private stopTimer() {
    clearInterval(this.interval);
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
      this.localPlayer.guessedCards.push(this.selectedCards[0]);

      this.sendMatchData(this.localPlayer.guessedCards.length);
      this.checkEndMatch();

      this.selectedCards[0].enabled = false;
      this.selectedCards[1].enabled = false;
    }
    else {
      this.selectedCards[0].enabled = true;
      this.selectedCards[1].enabled = true;

      this.selectedCards[0].memory_card.coverCard();
      this.selectedCards[1].memory_card.coverCard();
    }

    this.selectedCards = [];
    this.gameLogic.flippableCards = true;
  }

  /**
   * Controlla se l'utente ha indovinato tutte le carte oppure no.
   * In caso positivo, viene mostrato un alert di fine partita e, successivamente,
   * la classifica finale.
   */
  private checkEndMatch() {
    var button = [{ text: 'Vai alla classifica', handler: () => { this.showRanking(); } }];
    if (this.localPlayer.guessedCards.length == (this.gameLogic.memoryCards.length / 2)) {
      this.sendMatchData(this.localPlayer.guessedCards.length);
      this.gameLogic.terminaPartita();
      
      this.alertCreator.createAlert("HAI VINTO!", "Complimenti, hai indovinato tutte le carte in " + this.display, button);
      this.timerService.stopTimers(this.timerInfoPartita, this.gameLogic.timerGiocatori);
      this.stopTimer();
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
        this.timerService.stopTimers(this.gameLogic.timerGiocatori, this.timerInfoPartita, this.gameLogic.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  /**
   * Effettua la chiamata REST per aggiornare il database con le informazioni passate in input.
   * @param info 
   */
  private async sendMatchData(info) {
    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue, 'info_giocatore': info }

    this.http.put('/game/save', toSend).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.gameLogic.timerGiocatori, this.timerInfoPartita, this.gameLogic.timerPing);
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
    const modal = await this.modalController.create({
      component: ClassificaPage,
      componentProps: {
        classifica: this.calculateRanking()
      },
      cssClass: 'fullheight'
    });

    modal.onDidDismiss().then(async () => {
      this.timerService.stopTimers(this.gameLogic.timerPing);
      if (this.localPlayer.nickname == this.lobby.admin_lobby)
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      else
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
    });

    return await modal.present();
  }

  /**
   * Inserisce all'interno di una lista tutti i giocatori con il relativo punteggio.
   * @returns la lista ordinata ottenuta richiamando il metodo 'sortRanking'
   */
  private calculateRanking() {
    var classifica = [];
    var usernames = [];
    this.info_partita.info.giocatori.forEach(p => {
      if (p.username == this.localPlayer.nickname) {
        var toSave = { "username": this.localPlayer.nickname, "punteggio": this.localPlayer.guessedCards.length }
        classifica.push(toSave);
        usernames.push(toSave.username);
      } else {
        toSave = { "username": p.username, "punteggio": p.info_giocatore }
        classifica.push(toSave);
        usernames.push(toSave.username);
      }

    });
    if (classifica.length < this.gameLogic.players.length) {
      for (let index = 0; index < this.gameLogic.players.length; index++) {
        if (!(usernames.includes(this.gameLogic.players[index].nickname))) {
          var toSave = { "username": this.gameLogic.players[index].nickname, "punteggio": 0 }
          classifica.push(toSave);
          usernames.push(toSave.username);
        }
      }
    }

    return this.sortRanking(classifica);
  }

  /**
   * Ordina la classifica passata in input.
   * @param classifica 
   * @returns 
   */
  private sortRanking(classifica) {
    classifica.sort(function (a, b) {
      return b.punteggio - a.punteggio;
    });
    return classifica;
  }

  /**
   * Effettua la chiamata REST per ottenere le informazioni della partita di tutti i giocatori.
   */
  private async getInfoPartita() {
    var button = [{ text: 'Vai alla classifica', handler: () => { this.showRanking(); } }];
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/game/status', { headers }).subscribe(
      async (res) => {
        this.info_partita = res['results'];

        if (this.info_partita.info != null) {
          this.info_partita.info.giocatori.forEach(p => {
            if (p.info_giocatore == this.gameLogic.cards.length) {
              if (p.username != this.localPlayer.nickname) {
                this.alertCreator.createAlert("PECCATO!", p.username + " ha vinto la partita", button);
                this.timerService.stopTimers(this.timerInfoPartita);
                this.stopTimer();
              }
            }
          });
        }
      },
      async (res) => {
        this.timerService.stopTimers(this.gameLogic.timerGiocatori, this.timerInfoPartita, this.gameLogic.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Recupero informazioni partita fallito!');
      }
    );
  }

}