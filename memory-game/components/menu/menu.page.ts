import { Component, OnInit } from '@angular/core';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';

@Component({
  selector: 'app-memory-dashboard',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MemoryMenuPage implements OnInit {
  players = [];

  constructor(private dataKeeper: MemoryDataKeeperService) { }

  ngOnInit() {
    this.players = this.dataKeeper.getPlayers();
  }

}
