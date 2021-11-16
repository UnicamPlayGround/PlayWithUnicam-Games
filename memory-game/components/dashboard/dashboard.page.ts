import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  gameTime: string = new Date("2012-12-12T00:01:00").toISOString();
  gameMode: String;
  checkData: boolean;

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private router: Router) { }

  ngOnInit() {
    this.gameMode = this.dataKeeper.getGameMode();
    this.checkData = this.dataKeeper.checkData();
  }

  ngOnDestroy() {
    if (this.dataKeeper.getGameMode() == 'tempo') {
      var date = new Date(this.gameTime);
      this.dataKeeper.setGameTime(date.getMinutes(), date.getSeconds());
    }
  }

  setGameMode(mode) {
    this.gameMode=mode;
    this.dataKeeper.setGameMode(mode);
  }

  startGame() {
    this.router.navigateByUrl('/memory/game', { replaceUrl: true });
  }

}