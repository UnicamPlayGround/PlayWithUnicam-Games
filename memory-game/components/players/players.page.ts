import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';
import { MemoryPlayer } from '../memory-player';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage implements OnInit {
  private players: MemoryPlayer[];
  private newPlayer: FormGroup;

  constructor(
    private dataKeeper: MemoryDataKeeperService,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private router: Router) { }

  ngOnInit() {
    this.newPlayer = this.fb.group({
      nickname: ['', [Validators.required, Validators.maxLength(10)]],
    });
    this.fetchPlayers();
  }

  addPlayer() {
    if (this.newPlayer.value.nickname.length != 0) {
      this.dataKeeper.addPlayer(this.newPlayer.value.nickname);
      this.router.navigateByUrl('/memory', { replaceUrl: true });;
    } else this.alertCreator.createInfoAlert("Errore", "Il nickname non può essere vuoto!");
    //TODO: controllare bene che vi siano lettere
  }

  deletePlayer(index) {
    this.alertCreator.createConfirmationAlert("Vuoi davvero eliminare il giocatore selezionato?", () => {
      this.dataKeeper.deletePlayer(index);
      this.router.navigateByUrl('/memory', { replaceUrl: true });
    });
  }

  changePlayerNickname() {
    //TODO: implementare
  }

  fetchPlayers() {
    this.players = this.dataKeeper.getPlayers();
  }
}
