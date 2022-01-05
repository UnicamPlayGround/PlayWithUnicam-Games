import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
   * Il numero da riportare sulla carta per facilitare la distinzione con le altre
   * quando sono tutte coperte.
   */
  @Input('cardNumber') cardNumber: number;

  /**
   * Questo EventEmitter consente a questo component di comunicare con il suo parent emettendo
   * eventi contenenti determinati valori che saranno poi intercettati dal parent.
   */
  @Output() updateConfigEvent = new EventEmitter<Object>();
  @ViewChild('flipcard', { static: false }) flipcard: ElementRef;
  @ViewChild('inner') inner: ElementRef;

  constructor(private gameLogic: GameLogicService) { }

  ngAfterViewInit(): void { }

  ngOnInit() {
    this.card.memory_card = this;
  }

  revealCard() {
    this.inner.nativeElement.style.transform = "rotateY(180deg)";
  }

  coverCard() {
    this.inner.nativeElement.style.transform = "rotateY(0deg)";
  }
}
