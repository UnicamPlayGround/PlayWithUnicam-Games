import { Component, OnInit } from '@angular/core';
import { MemoryCard } from '../memory-card';

@Component({
  selector: 'app-memory-game-editor',
  templateUrl: './memory-game-editor.page.html',
  styleUrls: ['./memory-game-editor.page.scss'],
})
export class MemoryGameEditorPage implements OnInit {
  memoryCards: MemoryCard[] = [];

  constructor() { }

  ngOnInit() {
  }

  addNewCard(){
    
  }
}
