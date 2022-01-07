import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MemoryGameLogicService } from '../../services/game-logic/memory-game-logic.service';
import { MemoryCard } from '../memory-card';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { MemoryPlayer } from '../memory-player';
import { ModalController } from '@ionic/angular';
import { QuestionModalPage } from 'src/app/modal-pages/question-modal/question-modal.page';
import { Router } from '@angular/router';
import { Timer } from 'src/app/components/timer-components/timer';

@Component({
  selector: 'app-game',
  templateUrl: './memory-single.page.html',
  styleUrls: ['./memory-single.page.scss'],
})
export class MemorySingleGamePage implements OnInit, OnDestroy {
  selectedCards: MemoryCard[] = [];
  players: MemoryPlayer[] = [];
  carteScoperte = 0;

  timer: Timer = new Timer(10, false, () => this.terminaPartita());

  currentPlayerUsername: String;

  constructor(
    private memoryGameLogic: MemoryGameLogicService,
    private router: Router,
    private alertCreator: AlertCreatorService,
    private modalController: ModalController,
    private dataKeeper: MemoryDataKeeperService,
    private alertController: AlertCreatorService
  ) { }

  async ngOnInit() {
    await this.memoryGameLogic.initialize();

    if (this.dataKeeper.getGameMode() == "tempo")
      this.setTimer();
    this.currentPlayerUsername = this.memoryGameLogic.players[0].nickname;
  }

  ngOnDestroy() {
    this.dataKeeper.gameHasStarted = false;
    this.memoryGameLogic.reset();
    this.timer.stopTimer();
  }

  private setTimer() {
    this.timer.setTimerTime(this.convertTime(this.dataKeeper.getGameTime().minutes, this.dataKeeper.getGameTime().seconds));
    this.timer.startTimer();
  }

  private convertTime(minutes: string, seconds: string) {
    var min = (minutes.charAt(0) == "0") ? minutes.charAt(1) : minutes;
    var sec = (seconds.charAt(0) == "0") ? seconds.charAt(1) : seconds;
    return (Number(min) * 60) + Number(sec);
  }

  getCards() {
    return this.memoryGameLogic.getCards();
  }

  endTurn() {
    this.memoryGameLogic.endCurrentPlayerTurn();
    this.alertController.createInfoAlert("Fine del turno", "Ora è il turno di " + this.memoryGameLogic.getCurrentPlayer().nickname);
    this.currentPlayerUsername = this.memoryGameLogic.getCurrentPlayer().nickname;
  }

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
      this.memoryGameLogic.flippableCards = true;
    }
  }

  private getWinner() {
    return this.memoryGameLogic.players.reduce((a: MemoryPlayer, b: MemoryPlayer) => {
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
        this.memoryGameLogic.getCurrentPlayer().guessedCards.push(this.selectedCards[0]);
        this.controllaVittoria();
      }
      else {
        this.coverSelectedCards();
        this.endTurn();
      }
      this.selectedCards = [];
      this.memoryGameLogic.flippableCards = true;
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
    if (this.carteScoperte == (this.memoryGameLogic.memoryCards.length / 2))
      this.terminaPartita();
  }

  private terminaPartita() {
    this.timer.stopTimer();
    var button = [{
      text: 'Torna al menu', handler: () => {
        this.router.navigateByUrl('/memory', { replaceUrl: true });
      }
    }];
    this.alertCreator.createAlert("Fine della partita!", this.getWinner() + " ha vinto la partita!", button, false);
    this.dataKeeper.getPlayers().forEach(player => {
      player.guessedCards = [];
    });
  }


}
