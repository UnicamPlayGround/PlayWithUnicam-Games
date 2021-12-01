import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import { ToastCreatorService } from 'src/app/services/toast-creator/toast-creator.service';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class GameBuilderService {

  json = {
    height: 3,
    width: 3,
    cells: [
      { letter: "T" },
      { letter: "R" },
      { letter: "E" },
      { letter: "D" },
      { letter: "U" },
      { letter: "E" },
      { letter: "U" },
      { letter: "N" },
      { letter: "O" }
    ],

    words: [
      { word: "TRE", position: [0, 1, 2] },
      { word: "DUE", position: [3, 4, 5] },
      { word: "UNO", position: [6, 7, 8] }
    ]
  }

  cells = this.json.cells;
  words = this.json.words;

  constructor(private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private modalController: ModalController,
    private lobbyManager: LobbyManagerService,
    private timerService: TimerController,
    private errorManager: ErrorManagerService,
    private toastCreator: ToastCreatorService,
    private router: Router,
    private http: HttpClient,) {
    //this.getGameConfig();
}

ngOnInit(){
  this.createScoreboard();
}
 // //TODO: prende il config
  // async getGameConfig(){    
  //   const token_value = (await this.loginService.getToken()).value;
  //   const headers = { 'token': token_value };

  //   this.http.get('/game/config', { headers }).subscribe(
  //     async (res) => {
  //       this.cells = res['results'][0].config.cells;
  //       this.words = res['results'][0].config.words;
  //       //this.createScoreboard(this.cells);
  //       this.createScoreboard();
  //       //this.loadPlayers();
  //     },
  //     async (res) => {
  //       //this.timerService.stopTimers(this.timerGiocatori, this.timerInfoPartita, this.timerPing);
  //       this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
  //       this.errorManager.stampaErrore(res, 'File di configurazione mancante');
  //     }
  //   );

  // }

  //TODO
  createScoreboard() {
    var currentRowNumber = 0;
    var i = 0;

    this.cells.forEach(cell => {
      var newCell;
      if (cell.letter.length == 1) {
        newCell = this.createCell(cell.letter, i);
      } else
        newCell = this.createBlackCell(i);
      i++;
      const currentRow = document.getElementById("row" + currentRowNumber);
      
      if (currentRow.childNodes.length < this.json.width)
        currentRow.appendChild(newCell);
      else
        this.createNewRow(++currentRowNumber).appendChild(newCell);
      });
    //TODO: aggingere che se sono state messe tutte le celle riempire le restanti con nero
  }

  createCell(cellLetter, i) {
    const newCell = document.createElement("td");
    newCell.id = "c" + i;
    newCell.classList.add("game-cell");
    const label = document.createElement("ion-label");
    label.textContent = cellLetter;
    newCell.appendChild(label);
    return newCell;
  }

  createBlackCell(i) {
    const newCell = document.createElement("td");
    newCell.id = "c" + i;
    newCell.classList.add("black-cell");
    return newCell;
  }


  // private appendChildByDirection(parent, child, direction) {
  //   parent.appendChild(child);
  // }

  private createNewRow(currentRowNumber) {
    const newRow = document.createElement("tr");
    newRow.id = "row" + currentRowNumber;
    newRow.classList.add("row");
    document.getElementById("table").appendChild(newRow);
    return newRow;
  }
}
