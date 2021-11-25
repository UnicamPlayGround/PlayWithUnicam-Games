import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { UiBuilderService } from '../../services/game-builder/ui-builder.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { MemoryCard } from '../memory-card';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  selectedCards: MemoryCard[] = [];

  constructor(
    private gameLogic: GameLogicService,
    private dataKeeper: MemoryDataKeeperService,
    private uiBuilder: UiBuilderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.gameLogic.ngOnInit();
    console.log("è il turno di " + this.gameLogic.getCurrentPlayer().nickname);
  }

  getCards() {
    return this.gameLogic.getCards();
  }

  endTurn() {
    this.gameLogic.endCurrentPlayerTurn();
    console.log("Ora è il turno di " + this.gameLogic.getCurrentPlayer().nickname);
  }

  selectCard(card: MemoryCard) {
    if (this.gameLogic.flippableCards) {
      card.enabled = false;

      if (this.selectedCards.length < 2)
        this.selectedCards.push(card);
      console.log(this.selectedCards);

      if (this.selectedCards.length == 2) {
        this.gameLogic.flippableCards = false;

        this.compareCards();
        // setTimeout(() => {
        //   this.controllaCarteSelezionate();
        // }, 2000);
      }
    }
  }

  compareCards() {
    if (this.selectedCards[0] == this.selectedCards[1]) {
      console.log("SONO UGUALI");
      this.gameLogic.getCurrentPlayer().guessedCards.push(this.selectedCards[0]);
      console.log(this.gameLogic.getCurrentPlayer().nickname + " ha indovinato ");
      console.log(this.gameLogic.getCurrentPlayer().guessedCards);

    }
    else {
      console.log("SONO DIVERSE");

      this.selectedCards[0].enabled = true;
      this.selectedCards[1].enabled = true;
      this.gameLogic.endCurrentPlayerTurn();
    }
    this.selectedCards = [];
    this.gameLogic.flippableCards = true;
  }


}
