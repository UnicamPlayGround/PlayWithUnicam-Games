import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

@Component({
  selector: 'app-goose-game-editor',
  templateUrl: './goose-game-editor.component.html',
  styleUrls: ['./goose-game-editor.component.scss'],
})
export class GooseGameEditorComponent implements OnInit {
  cells = [];
  expandedCell: Number;
  bulkEdit = false;
  edit = {};

  @Input('config') config = { cells: [] };
  @Output() updateConfigEvent = new EventEmitter<Object>();

  constructor(private alertCreator: AlertCreatorService) {
    //this.cells = this.config.cells;
  }

  ngOnInit() {
    //console.log("this.config", this.config);
  }

  updateConfig() {
    this.updateConfigEvent.emit(this.config);
  }

  trackEditList(index, item) {
    return index;
  }

  /**
  * Controlla se ci sono caselle selezionate tramite le checkbox.
  * 
  * @returns true se almeno un elemento è selezionato, false altrimenti
  */
  checkSelectedCells() {
    var selected = false;
    let keys = Object.keys(this.edit);
    while (keys.length) {
      if (this.edit[keys.pop()]) selected = true;
    }
    return selected;
  }

  /**
 * Elimina le caselle selezionate.
 */
  deleteSelectedCells() {
    let toDelete = Object.keys(this.edit);
    const indexesToDelete = toDelete.filter(index => this.edit[index]).map(key => +key);

    while (indexesToDelete.length) {
      this.config.cells.splice(indexesToDelete.pop(), 1);
    }
  }

  bulkDelete() {
    if (this.bulkEdit) {
      if (this.edit && Object.keys(this.edit).length != 0 && this.edit.constructor === Object && this.checkSelectedCells())
        this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare le caselle selezionate?", () => {
          this.deleteSelectedCells();
          this.toggleBulkEdit();
        });
      else this.alertCreator.createInfoAlert('Errore', 'Seleziona prima qualche elemento!');
    }
    else {
      this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare tutte le caselle?", () => {
        this.config.cells = [];//this.cells = [];
      });
    }
  }

  /**
   * Abilita il selezionamento multiplo degli elementi per l'eliminazione.
   */
  toggleBulkEdit() {
    this.expandedCell = null;
    this.bulkEdit = !this.bulkEdit;
    this.edit = {};
  }

  expandCell(cell) {
    if (this.expandedCell != cell)
      this.expandedCell = cell;
    else this.expandedCell = null;
  }

  addCell() {
    if (this.config.cells.length == 0)
      this.config.cells.push(this.getCellObject(0));
    this.config.cells.push(this.getCellObject(this.cells.length));
  }

  getCellObject(index) {
    return {
      title: index,
      question: { img_url: "", video_url: "", q: "", answers: [] }
    }
  }

  addAnswer(cellIndex) {
    this.config.cells[cellIndex].question.answers.push(null);
  }

  deleteAnswer(cellIndex, answerIndex) {
    this.config.cells[cellIndex].question.answers.splice(answerIndex, 1);
  }

  saveModifications() {
    const newConfig = { cells: this.config.cells };
    console.log(newConfig);
  }

}
