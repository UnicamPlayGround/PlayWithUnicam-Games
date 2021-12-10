import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { MemoryCard } from '../memory-card';
import { MemoryPlayer } from '../memory-player';
import { CardQuestionPage } from '../../modal-page/card-question/card-question.page';
import { ModalController } from '@ionic/angular';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {
  selectedCards: MemoryCard[] = [];
  players: MemoryPlayer[] = [];
  carteScoperte = 0;

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
    this.gameLogic.initialization();
    //se gamemode è a tempo prendi il tempo e gestisci il countdown  (normal/tempo)
  }

  ngOnDestroy() {
    this.gameLogic.stopTimers();
  }

  getCards() {
    return this.gameLogic.getCards();
  }

  endTurn() {
    this.gameLogic.endCurrentPlayerTurn();
    this.alertController.createInfoAlert("FINE TURNO", "Ora è il turno di " + this.gameLogic.getCurrentPlayer().nickname);
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
      component: CardQuestionPage,
      componentProps: {
        card: card
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const rispostaCorretta = data['data'];

      if (rispostaCorretta) {
        this.carteScoperte += 1;
        this.gameLogic.getCurrentPlayer().guessedCards.push(this.selectedCards[0]);
      }
      else {
        this.selectedCards[0].enabled = true;
        this.selectedCards[1].enabled = true;

        this.selectedCards[0].memory_card.coverCard();
        this.selectedCards[1].memory_card.coverCard();

        this.endTurn();
      }
      this.selectedCards = [];
      this.gameLogic.flippableCards = true;

      this.controllaVittoria();
    });

    await modal.present();
  }

  controllaVittoria() {
    if (this.carteScoperte == this.gameLogic.cards.length) {
      var button = [{
        text: 'TORNA AL MENU', handler: () => {
          this.gameLogic.stopTimers();
          this.router.navigateByUrl('/memory', { replaceUrl: true });
        }
      }];
      this.alertCreator.createAlert("PARTITA TERMINATA", "Il giocatore " + this.getWinner() + " ha vinto la partita", button);
    }
  }


}
