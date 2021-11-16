import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  private gameTime: string = new Date("2012-12-12T00:01:00").toISOString();

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private router: Router) { }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.dataKeeper.getGameMode() == 'tempo') {
      var date = new Date(this.gameTime);
      this.dataKeeper.setGameTime(date.getMinutes(), date.getSeconds());
    }
  }

  setGameMode(mode) {
    this.dataKeeper.setGameMode(mode);
  }

  startGame() {
    this.router.navigateByUrl('/memory/game', { replaceUrl: true });
  }

}
