import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';

@Component({
  selector: 'app-memory-dashboard',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MemoryMenuPage implements OnInit {
  players = [];
  timerPing;

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private gameLogic: GameLogicService,
    private timerController: TimerController,
    private alertCreator: AlertCreatorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.players = this.dataKeeper.getPlayers();
    this.gameLogic.ping();
    this.timerPing = this.timerController.getTimer(() => { this.gameLogic.ping() }, 4000);
  }

  ngOnDestroy() {
    this.timerController.stopTimers(this.timerPing);
    this.dataKeeper.reset();
  }

  backToLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler tornare alla lobby?',
      async () => {
        this.timerController.stopTimers(this.timerPing);
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      });
  }

}
