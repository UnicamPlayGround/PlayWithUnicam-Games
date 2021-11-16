import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameEditorComponent } from 'src/app/components/game-editor/game-editor.component';

@Component({
  selector: 'app-memory-game-editor',
  templateUrl: './memory-game-editor.component.html',
  styleUrls: ['./memory-game-editor.component.scss'],
})
export class MemoryGameEditorComponent implements OnInit, GameEditorComponent {
  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('config') config = { cards: [] };
  /**
   * Questo EventEmitter consente a questo component di comunicare con il suo parent emettendo
   * eventi contenenti determinati valori che saranno poi intercettati dal parent.
   */
  @Output() updateConfigEvent = new EventEmitter<Object>();

  constructor() { }

  ngOnInit() { }

  //TODO: remove
  onClick() {

  }

  addCard() {
    this.config.cards.push({ link: "", nome: "", descrizione: "" });
  }
}
