import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { GameLogicService } from '../../services/game-logic/game-logic.service';
import { MemoryPlayer } from '../memory-player';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage implements OnInit, OnDestroy {
  players: MemoryPlayer[];
  newPlayer: FormGroup;

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private gameLogic: GameLogicService,
    private timerService: TimerController,
    private router: Router) { }

  ngOnInit() {
    this.newPlayer = this.fb.group({
      nickname: ['', [Validators.required, Validators.maxLength(10)]],
    });
    this.fetchPlayers();
  }

  ngOnDestroy() { }

  addPlayer() {
    if (this.newPlayer.value.nickname.length != 0) {
      this.dataKeeper.addPlayer(this.newPlayer.value.nickname);
      this.newPlayer.reset();      
    } else this.alertCreator.createInfoAlert("Errore", "Il nickname non può essere vuoto!");
    //TODO: controllare bene che vi siano lettere
  }

  deletePlayer(index) {
    this.alertCreator.createConfirmationAlert("Vuoi davvero eliminare il giocatore selezionato?", () => {
      this.dataKeeper.deletePlayer(index);
    });
  }

  changePlayerNickname() {
    //TODO: implementare
  }

  fetchPlayers() {
    this.players = this.dataKeeper.getPlayers();
  }
}
