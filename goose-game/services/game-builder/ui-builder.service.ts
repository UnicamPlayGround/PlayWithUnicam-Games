import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiBuilderService {

  constructor() { }

  /**
   * Costruisce il tabellone di gioco in base alle caselle contenute nell'array
   * passato in input.
   * 
   * @param cells L'array di caselle con cui costruire il tabellone.
   */
  createGameBoard(cells) {
    var currentRowNumber = 0;
    var direction = true;

    cells.forEach(cell => {
      const newCell = this.createGameCell(cell.title);
      const currentRow = document.getElementById("row" + currentRowNumber);

      if (currentRow.childNodes.length < 8) {
        if (currentRowNumber % 2 == 0) this.appendChildByDirection(currentRow, newCell, direction);
        else {
          this.fillRowWithEmptyCells(currentRow, direction);
          this.createNewRow(++currentRowNumber).appendChild(newCell);
        }
      } else {
        direction = !direction;
        this.createNewRow(++currentRowNumber).appendChild(newCell);
      }
    });

    if (document.getElementById("row" + currentRowNumber).childNodes.length < 8) {
      this.fillRowWithEmptyCells(document.getElementById("row" + currentRowNumber), direction);
    }
  }

  /**
   * Crea una nuova riga del tabellone e la ritorna.
   * 
   * @param currentRowNumber Il numero della nuova riga da creare.
   * @returns La nuova riga creata.
   */
  private createNewRow(currentRowNumber) {
    const newRow = document.createElement("tr");
    newRow.id = "row" + currentRowNumber;
    newRow.classList.add("row");
    document.getElementById("table").appendChild(newRow);
    return newRow;
  }

  /**
   * Crea una nuova casella di gioco con all'interno una label contentente il numero della casella.
   * 
   * @param cellNumber Il numero della casella da creare.
   * @returns La nuova casella creata.
   */
  private createGameCell(cellNumber) {
    const newCell = document.createElement("td");
    newCell.id = "c" + cellNumber;
    newCell.classList.add("game-cell");
    const label = document.createElement("ion-label");
    label.textContent = cellNumber;
    newCell.appendChild(label);
    return newCell;
  }

  /**
   * Crea una nuova casella vuota (invisibile).
   * 
   * @returns La casella vuota creata.
   */
  private createEmptyCell() {
    const emptyCell = document.createElement("td");
    emptyCell.classList.add("empty-cell");
    return emptyCell;
  }

  /**
   * Aggiunge il nodo 'child' come figlio del nodo 'parent' a seconda del valore
   * di 'direction': se è true aggiunge in coda, altrimenti aggiunge all'inizio.
   * 
   * @param parent Il container dentro cui aggiungere il nuovo nodo.
   * @param child Il nuovo nodo da aggiungere dentro il nodo container.
   * @param direction Determina dove aggiungere il nuovo nodo.
   */
  private appendChildByDirection(parent, child, direction) {
    if (direction) parent.appendChild(child);
    else parent.insertBefore(child, parent.firstChild);
  }

  /**
   * Aggiunge alla riga passata in input tante caselle vuote quante necessarie
   * affinché la riga contenga un totale di 8 caselle.
   * Se 'direction' è true le aggiunge in coda, altrimenti le aggiunge all'inizio.
   * 
   * @param currentRow La riga a cui aggiungere caselle vuote.
   * @param direction Il verso di aggiunta delle caselle vuote.
   */
  private fillRowWithEmptyCells(currentRow, direction) {
    const nToAdd = 8 - currentRow.childNodes.length;

    for (let i = 0; i < nToAdd; i++)
      this.appendChildByDirection(currentRow, this.createEmptyCell(), direction);
  }

  /**
   * Costruisce le pedine dei vari giocatori che partecipano alla partita in base
   * all'array passato in input.
   * 
   * @param gamePlayers L'array di giocatori per i quali costruire le pedine.
   */
  createPlayersGoose(gamePlayers) {
    gamePlayers.forEach(player => {
      const goose = document.createElement("div");
      goose.id = player.goose;
      goose.title = player.username;
      goose.classList.add("goose");
      goose.classList.add(player.goose);
      goose.appendChild(this.getGooseName(player.username));
      goose.appendChild(this.getGooseImg(player.goose));
      document.getElementById("c0").appendChild(goose);
    });
  }

  /**
   * Crea e ritorna un elemento <p> il cui testo è dato dal
   * valore di 'username'.
   * @param username Il testo da scrivere dentro il <p>.
   * @returns L'elemento <p> creato.
   */
  private getGooseName(username) {
    const name = document.createElement("p");
    name.textContent = username;
    return name;
  }

  /**
   * Crea e ritorna un elemento <img> la cui 'src' è data dal
   * file il cui basename è il valore di 'goose'.
   * 
   * @param goose Il basename dell'immagine da aprire.
   * @returns L'elemento <img> creato.
   */
  private getGooseImg(goose) {
    const img = document.createElement("img");
    img.src = "game-assets/goose-game/game-assets/" + goose + ".png";
    return img;
  }
}
