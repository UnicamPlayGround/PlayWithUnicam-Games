import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { MemoryCard } from '../memory-card';
import { MemoryPlayer } from '../memory-player';
import { ModalController } from '@ionic/angular';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { QuestionModalPage } from 'src/app/modal-pages/question-modal/question-modal.page';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  selectedCards: MemoryCard[] = [];
  players: MemoryPlayer[] = [];
  carteScoperte = 0;

  timeMode = false;
  interval;
  minutes;
  seconds;

  constructor(
    private gameLogic: GameLogicService,
    private router: Router,
    private alertCreator: AlertCreatorService,
    private timerService: TimerController,
    private modalController: ModalController,
    private dataKeeper: MemoryDataKeeperService,
    private alertController: AlertCreatorService
  ) { }

  ngOnInit() {
    this.gameLogic.initialize();

    if (this.dataKeeper.getGameMode() == "tempo")
      this.setTimer();
  }

  private setTimer() {
    this.timeMode = true;
    this.minutes = this.dataKeeper.getGameTime().minutes;
    this.seconds = this.dataKeeper.getGameTime().seconds;
    this.startTimer();
  }

  private startTimer() {
    this.interval = setInterval(() => {
      if (this.seconds == 0) {
        this.minutes -= 1;
        this.seconds = 59;
      }
      this.seconds -= 1;
      if (this.seconds == 0 && this.minutes == 0)
        this.terminaPartita();

    }, 1000);
  }

  getCards() {
    return this.gameLogic.getCards();
  }

  endTurn() {
    this.gameLogic.endCurrentPlayerTurn();
    this.alertController.createInfoAlert("Fine del turno", "Ora è il turno di " + this.gameLogic.getCurrentPlayer().nickname);
  }

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

  compareCards() {
    if (this.selectedCards[0].title == this.selectedCards[1].title) {
      this.selectedCards[0].enabled = false;
      this.selectedCards[1].enabled = false;
      this.presentaDomanda(this.selectedCards[0]);
    }
    else {
      this.selectedCards[0].enabled = true;
      this.selectedCards[1].enabled = true;

      this.selectedCards[0].memory_card.coverCard();
      this.selectedCards[1].memory_card.coverCard();

      this.endTurn();
      this.selectedCards = [];
      this.gameLogic.flippableCards = true;
    }
  }

  private getWinner() {
    return this.gameLogic.players.reduce((a: MemoryPlayer, b: MemoryPlayer) => {
      if (a.guessedCards.length > b.guessedCards.length) {
        return a;
      } else return b;
    }).nickname;
  }

  private async presentaDomanda(card: MemoryCard) {
    const modal = await this.modalController.create({
      component: QuestionModalPage,
      componentProps: {
        question: card.question
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const rispostaCorretta = data['data'];

      if (rispostaCorretta) {
        this.carteScoperte += 1;
        this.gameLogic.getCurrentPlayer().guessedCards.push(this.selectedCards[0]);
        this.controllaVittoria();
      }
      else {
        this.coverSelectedCards();
        this.endTurn();
      }
      this.selectedCards = [];
      this.gameLogic.flippableCards = true;
    });

    await modal.present();
  }

  private coverSelectedCards() {
    this.selectedCards[0].enabled = true;
    this.selectedCards[1].enabled = true;

    this.selectedCards[0].memory_card.coverCard();
    this.selectedCards[1].memory_card.coverCard();
  }

  controllaVittoria() {
    if (this.carteScoperte == this.gameLogic.cards.length)
      this.terminaPartita();
  }

  private terminaPartita() {
    var button = [{
      text: 'Torna al menu', handler: () => {
        this.router.navigateByUrl('/memory', { replaceUrl: true });
      }
    }];
    this.alertCreator.createAlert("Fine della partita!", this.getWinner() + " ha vinto la partita!", button);
    this.dataKeeper.getPlayers().forEach(player => {
      player.guessedCards = [];
    });
    if (this.timeMode) clearInterval(this.interval);
  }


}
