import { Injectable } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { MemoryPlayer } from '../../components/memory-player';

@Injectable({
  providedIn: 'root'
})
export class MemoryDataKeeperService {
  private players: MemoryPlayer[] = [];
  private gameMode: String;
  private gameTime = { minutes: "01", seconds: "00" };

  constructor(private alertCreator: AlertCreatorService) { }

  checkData() {
    return ((this.players.length > 0) && (this.gameMode != undefined));
  }

  getPlayers() {
    return this.players;
  }

  getGameMode() {
    return this.gameMode;
  }

  setGameMode(mode: String) {
    this.gameMode = mode;
  }

  getGameTime() {
    return this.gameTime;
  }

  setGameTime(minutes: number, seconds: number) {
    var min = (minutes < 10) ? "0" + minutes : minutes.toString();
    var sec = (seconds < 10) ? "0" + seconds : seconds.toString();

    this.gameTime.minutes = min;
    this.gameTime.seconds = sec;
  }

  addPlayer(nickname) {
    if (this.players.length > 0) {
      var nicknames = this.players.map(p => p.nickname);

      if (!nicknames.includes(nickname))
        this.players.push(new MemoryPlayer(nickname));
      else this.alertCreator.createInfoAlert("Errore", "Esiste già un giocatore con questo nickname!")
    } else this.players.push(new MemoryPlayer(nickname));
  }

  deletePlayer(index) {
    this.players.splice(index, 1);
  }

  reset() {
    this.players = [];
    this.gameMode = null;
    this.gameTime = { minutes: "01", seconds: "00" };
  }

}
