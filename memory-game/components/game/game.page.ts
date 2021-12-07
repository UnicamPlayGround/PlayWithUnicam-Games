import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { UiBuilderService } from '../../services/game-builder/ui-builder.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { MemoryCard } from '../memory-card';
import { MemoryPlayer } from '../memory-player';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  selectedCards: MemoryCard[] = [];
  players: MemoryPlayer[] = [];
  carteScoperte = 0;

  constructor(
    private gameLogic: GameLogicService,
    private dataKeeper: MemoryDataKeeperService,
    private uiBuilder: UiBuilderService,
    private router: Router,
    private alertCreator: AlertCreatorService,
    private timerService: TimerController
  ) { }

  ngOnInit() {
    this.gameLogic.initialization();
    this
  }

  getCards() {
    return this.gameLogic.getCards();
  }

  endTurn() {
    this.gameLogic.endCurrentPlayerTurn();
    console.log("Ora è il turno di " + this.gameLogic.getCurrentPlayer().nickname);
  }

  selectCard(card: MemoryCard) {
    if (card.enabled && this.gameLogic.flippableCards && !this.selectedCards.includes(card)) {

      if (this.selectedCards.length < 2) {
        card.memory_card.revealCard();
        this.selectedCards.push(card);
      }

      console.log(this.selectedCards);

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
      console.log("SONO UGUALI");
      this.gameLogic.getCurrentPlayer().guessedCards.push(this.selectedCards[0]);
      this.carteScoperte += 1;
      if (this.carteScoperte == this.gameLogic.cards.length) {
        var button = [{
          text: 'TORNA AL MENU', handler: () => {
            this.timerService.stopTimers(this.gameLogic.timerPing);
            this.router.navigateByUrl('/memory', { replaceUrl: true });
          }
        }];
        this.alertCreator.createAlert("PARTITA TERMINATA", "Il giocatore " + this.getWinner() + " ha vinto la partita", button);
      }

      this.selectedCards[0].enabled = false;
      this.selectedCards[1].enabled = false;

      console.log(this.gameLogic.getCurrentPlayer().nickname + " ha indovinato ");
      console.log(this.gameLogic.getCurrentPlayer().guessedCards);
    }
    else {
      console.log("SONO DIVERSE");

      this.selectedCards[0].enabled = true;
      this.selectedCards[1].enabled = true;

      this.selectedCards[0].memory_card.coverCard();
      this.selectedCards[1].memory_card.coverCard();

      this.gameLogic.endCurrentPlayerTurn();
    }
    this.selectedCards = [];
    this.gameLogic.flippableCards = true;
  }

  private getWinner() {
    return this.gameLogic.players.reduce((a: MemoryPlayer, b: MemoryPlayer) => {
      if (a.guessedCards.length > b.guessedCards.length) {
        return a;
      } else return b;
    }).nickname;
  }


}
