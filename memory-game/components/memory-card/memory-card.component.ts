import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { MemoryCard } from '../memory-card';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrls: ['./memory-card.component.scss'],
})
export class MemoryCardComponent implements OnInit, AfterViewInit {
  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('card') card: MemoryCard;
  /**
   * Questo EventEmitter consente a questo component di comunicare con il suo parent emettendo
   * eventi contenenti determinati valori che saranno poi intercettati dal parent.
   */
  @Output() updateConfigEvent = new EventEmitter<Object>();
  @ViewChild('flipcard', { static: false }) flipcard: ElementRef;
  @ViewChild('inner') inner: ElementRef;

  isCovered = true;

  constructor(private gameLogic: GameLogicService) { }

  ngAfterViewInit(): void {
    this.flipcard.nativeElement.addEventListener('click', () => { this.flipCard() });
  }

  ngOnInit() { }

  flipCard() {
    if (this.card.enabled && this.gameLogic.flippableCards) {
      if (this.isCovered) {
        this.inner.nativeElement.style.transform = "rotateY(180deg)";
        this.isCovered = !this.isCovered;
      } else {
        this.inner.nativeElement.style.transform = "rotateY(0deg)";
        this.isCovered = !this.isCovered;
      }
    }
    this.card.enabled = false;
  }
}
