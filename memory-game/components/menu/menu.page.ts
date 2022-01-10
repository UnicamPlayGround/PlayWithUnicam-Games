import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { MemoryGameLogicService } from '../../services/game-logic/memory-game-logic.service';

@Component({
  selector: 'app-memory-dashboard',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MemoryMenuPage implements OnInit {
  players = [];
  timerPing;
  private workerPing = new Worker(new URL('src/app/workers/timer-worker.worker', import.meta.url));

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private memoryGameLogic: MemoryGameLogicService,
    private timerController: TimerController,
    private alertCreator: AlertCreatorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.players = this.dataKeeper.getPlayers();
    this.memoryGameLogic.ping();
    this.initializeTimers();
  }

  ngOnDestroy() {
    this.stopTimers();
    this.dataKeeper.reset();
  }

  /**
   * Inizializza i timer della pagina.
   */
  private initializeTimers() {
    if (typeof Worker !== 'undefined') {
      this.workerPing.onmessage = () => { this.memoryGameLogic.ping() };
      this.workerPing.postMessage(4000);
    } else {
      // Gli Web Worker non sono supportati.
      this.timerPing = this.timerController.getTimer(() => { this.memoryGameLogic.ping() }, 4000);
    }
  }

  /**
   * Ferma i timer della pagina
   */
  private stopTimers() {
    this.workerPing.terminate();
    this.timerController.stopTimers(this.timerPing);
  }

  getGameHasStarted() {
    return this.dataKeeper.gameHasStarted;
  }

  addPlayer() {
    this.router.navigateByUrl('/memory/players');
  }

  backToLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler tornare alla lobby?',
      async () => {
        this.stopTimers();
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
      });
  }

}
