import { Injectable, OnInit } from '@angular/core';
import { MemoryCard } from '../../components/memory-card';
import { MemoryPlayer } from '../../components/memory-player';
import { MemoryDataKeeperService } from '../data-keeper/data-keeper.service';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService implements OnInit {
  config = {
    version: "single",
    cards: [
      { title: "hard disk", text: "aaaaaaaaaaaaaaa", url: "https://www.street-price.it/data/image/product/big/DT01ACA100-zKeJ.jpg" },
      { title: "mouse", text: "bbbbbbbbbbbbbbb", url: "https://m.media-amazon.com/images/I/61UxfXTUyvL._AC_SL1500_.jpg" },
      { title: "monitor", text: "ccccccccccccccc", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/LG_L194WT-SF_LCD_monitor.jpg/1200px-LG_L194WT-SF_LCD_monitor.jpg" }
    ]
  };
  cards: MemoryCard[] = [];
  players: MemoryPlayer[] = [];
  currentPlayer: MemoryPlayer;
  flippableCards = false;

  constructor(private dataKeeper: MemoryDataKeeperService) { }

  ngOnInit(): void {
    /**
     * getGameConfig()
     * fa partire timer per ping()
     * 
     */

    this.getGameConfig();
    this.setPlayers();
    this.setCards();
    this.flippableCards = true;
  }

  ping() {
    //REST
  }

  getGameConfig() {
    //REST
  }

  updatePlayers() {
    //REST
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  endCurrentPlayerTurn() {
    var index = this.players.indexOf(this.currentPlayer);
    if (index < (this.players.length - 1))
      this.currentPlayer = this.players[index + 1];
    else this.currentPlayer = this.players[0];
    this.flippableCards = !this.flippableCards;
  }

  private setPlayers() {
    if (this.config.version == "single") {
      this.players = this.dataKeeper.getPlayers();
    }
    else {
      this.updatePlayers();
      //avvio il timer per updatePlayers()
    }
    this.currentPlayer = this.players[0];
    console.log("currentPlayer: ", this.currentPlayer);
  }

  getCards() {
    return this.cards;
  }

  private setCards() {
    this.config.cards.forEach(card => {
      this.cards.push(new MemoryCard(card.title, card.text, card.url));
    });

    this.doubleCards();
    this.shuffleCards();
  }

  private doubleCards() {
    var tmp = this.cards.length;
    for (let index = 0; index < tmp; index++) {
      this.cards.push(this.cards[index]);
    }
  }

  private shuffleCards() {
    var currentIndex = this.cards.length;
    var temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

}
