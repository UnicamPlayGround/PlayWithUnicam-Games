import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameEditorComponent } from 'src/app/components/game-editor/game-editor.component';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

@Component({
  selector: 'app-goose-game-editor',
  templateUrl: './goose-game-editor.component.html',
  styleUrls: ['./goose-game-editor.component.scss'],
})
export class GooseGameEditorComponent implements OnInit, GameEditorComponent {
  expandedCell: Number;
  bulkEdit = false;
  edit = {};

  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('config') config = { cells: [] };

  /**
   * Questo EventEmitter consente a questo component di comunicare con il suo parent emettendo
   * eventi contenenti determinati valori che saranno poi intercettati dal parent.
   */
  @Output() updateConfigEvent = new EventEmitter<Object>();

  constructor(private alertCreator: AlertCreatorService) { }

  ngOnInit() { }

  /**
   * Quando l'utente salva la configurazione del gioco tramite l'apposito button,
   * emette un evento contenente il config del gioco aggiornato che verrà poi catturato dal
   * componente parent.
   */
  updateConfig() {
    if (this.config.cells.length > 0)
      this.updateConfigEvent.emit(this.config);
    else this.alertCreator.createInfoAlert("Errore", "Il tabellone non può essere lasciato vuoto!");
  }

  /**
   * Fa sì che gli <ion-input> corrispondenti alle domande/risposte di ogni casella non vengano
   * renderizzate ad ogni nuova digitazione.
   * 
   * @param index L'indice della casella che si sta modificando.
   * @param item 
   * @returns 
   */
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

  /**
   * Se la selezione caselle non è abilitata, elimina tutte le caselle dopo aver chiesto
   * conferma tramite un alert.
   * Se la selezione caselle è abilitata, elimina solo le caselle selezionate, se ve ne sono,
   * altrimenti mostra un errore.
   */
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
        this.config.cells = [];
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

  /**
   * Assegna alla variabile expandedCell il valore dell'indice della casella che l'utente
   * ha selezionato.
   * @param cell La casella selezionata.
   */
  expandCell(cell) {
    if (this.expandedCell != cell)
      this.expandedCell = cell;
    else this.expandedCell = null;
  }

  /**
   * Aggiunge una nuova casella al tabellone.
   * Se il tabellone è vuoto, viene prima aggiunta la casella 0, ovvero la casella
   * di partenza delle pedine.
   */
  addCell() {
    if (this.config.cells.length == 0)
      this.config.cells.push(this.getCellObject(0));
    this.config.cells.push(this.getCellObject(this.config.cells.length));
  }

  /**
   * Ritorna un nuovo oggetto casella.
   * @param index L'indice della nuova casella creata.
   * @returns L'oggetto creato.
   */
  getCellObject(index) {
    return {
      title: index,
      question: { img_url: "", video_url: "", q: "", answers: [] }
    }
  }

  /**
   * Aggiunge una nuova risposta alla domanda della casella selezionata.
   * @param cellIndex L'indice della casella selezionata.
   */
  addAnswer(cellIndex) {
    this.config.cells[cellIndex].question.answers.push(null);
  }

  /**
   * Elimina una data risposta dalla casella selezionata.
   * @param cellIndex L'indice della casella selezionata.
   * @param answerIndex L'indice della risposta da eliminare.
   */
  deleteAnswer(cellIndex, answerIndex) {
    this.config.cells[cellIndex].question.answers.splice(answerIndex, 1);
  }

}
