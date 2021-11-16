import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { MemoryPlayer } from '../memory-player';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  players: MemoryPlayer[];

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private router: Router
  ) { }

  ngOnInit() {
    this.players = this.dataKeeper.getPlayers();
  }

  startCountdown() {
    var gameTime: { minutes, seconds } = this.dataKeeper.getGameTime();
    var duration = (gameTime.minutes * 60) + gameTime.seconds;
    var start = Date.now(),
      diff,
      minutes,
      seconds;
    function timer() {
      // get the number of seconds that have elapsed since 
      // startTimer() was called
      diff = duration - (((Date.now() - start) / 1000) | 0);

      // does the same job as parseInt truncates the float
      minutes = (diff / 60) | 0;
      seconds = (diff % 60) | 0;

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      document.getElementById('countdownLabel').textContent = minutes + ":" + seconds;

      if (diff <= 0) {
        // add one second so that the count down starts at the full duration
        // example 05:00 not 04:59
        start = Date.now() + 1000;
      }
    };
    // we don't want to wait a full second before the timer starts
    timer();
    setInterval(timer, 1000);
  }

}
