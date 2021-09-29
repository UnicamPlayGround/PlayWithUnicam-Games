import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ModalController } from '@ionic/angular';
import { CreaParolaModalPage } from '../crea-parola-modal/crea-parola-modal.page';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
})
export class EditorPage implements OnInit {

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

  cells = [];

  dimensioni: FormGroup;
  parolaCorrente;
  definizioneCorrente;
  orientamentoCorrente;
  questionNumber = 1;


  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private alertCreator: AlertCreatorService
  ) { }

  ngOnInit() {
    this.dimensioni = this.fb.group({
      altezza: ['', [Validators.required, Validators.maxLength(10)]],
      larghezza: ['', [Validators.required, Validators.maxLength(10)]]
    });
  }

  /**
   * Crea il tabellone con le dimensioni richieste.
   * Il tabellone inizialmente è vuoto.
   * Ogni volta che l'utente preme su una casella, viene mostrata la modal dove l'utente deve inserire la nuova parola e, 
   * se vengono rispettati tutti i vincoli, la parola verrà inserita nel tabellone
   * 
   */
  creaTabellone() {
    var currentRowNumber = 0;
    var nCasella = 0;

    for (let index = 0; index < this.dimensioni.value.altezza; index++) {
      for (let j = 0; j < this.dimensioni.value.larghezza; j++) {
        var newCell = this.createCell(nCasella);
        const currentRow = document.getElementById("row" + currentRowNumber);
        currentRow.appendChild(newCell);
        this.cells.push({
          'letter': "white",
          'row': index,
          'col': j
        })
        nCasella++;
      }
      this.createNewRow(++currentRowNumber);
    }
    console.log(this.cells)
  }

  /**
   * Inserisce nel tabellone la nuova casella con la lettera passata in input
   * @param cellLetter lettera da inserire nella casella
   * @param i posizione della casella
   * @returns la nuova casella
   */
  private createCell(i) {
    const newCell = document.createElement("td");
    newCell.id = "c" + i;
    newCell.classList.add("game-cell");

    newCell.onclick = () => { this.apriModal(i); };

    return newCell;
  }

  /**
 * Crea una casella nera e la inserisce nel tabellone
 * @param i posizione della tabella da annerire
 */
  private createBlackCell(i) {
    const newCell = document.getElementById("c" + i);
    newCell.classList.add("black-cell");
    newCell.onclick = () => { };
    this.cells[i].letter = "black";
  }

  /**
   * Apre la modal.
   * Una volta chiusa, la parola verrà inserita nel tabellone se vengono rispettati tutti i vincoli.
   * Altrimenti mostra un alert di errore
   * @param i posizione della casella iniziale
   * @returns apre la modal
   */
  async apriModal(i) {
    const modal = await this.modalController.create({
      component: CreaParolaModalPage,
      cssClass: 'crea-parola'
    });

    modal.onDidDismiss().then((data) => {
      const datiParola = data['data'];

      if (datiParola.parola.length > 1) {
        this.parolaCorrente = datiParola.parola;
        this.definizioneCorrente = datiParola.definizioneCorrente;
        this.orientamentoCorrente = datiParola.orientamento;

        if (this.orientamentoCorrente == "VERTICALE") {
          var riga = this.cells[i].row;
          var caselleDisponibiliInOrizzontale = this.getCaselleDisponibiliInVerticale(riga, i, this.parolaCorrente);

          if (this.parolaCorrente.length <= caselleDisponibiliInOrizzontale) {
            if (caselleDisponibiliInOrizzontale == this.dimensioni.value.altezza - this.cells[i].row)
              this.insertVerticalWord(i, false);
            else {
              if (this.parolaCorrente.length == caselleDisponibiliInOrizzontale && this.cells[i + (this.dimensioni.value.larghezza * this.parolaCorrente.length)].letter == "white")
                this.insertVerticalWord(i, true);
              else this.insertVerticalWord(i, false);
            }
          } else this.alertCreator.createInfoAlert("ERRORE", "Non ci sono abbastanza caselle disponibili");
        }

        if (this.orientamentoCorrente == "ORIZZONTALE") {
          var col = this.cells[i].col;
          var caselleDisponibiliInOrizzontale = this.getCaselleDisponibiliInOrizzontale(col, i, this.parolaCorrente);

          if (this.parolaCorrente.length <= caselleDisponibiliInOrizzontale) {
            if (caselleDisponibiliInOrizzontale == this.dimensioni.value.larghezza - this.cells[i].col)
              this.insertHorizontalWord(i, false);
            else {
              if (this.parolaCorrente.length == caselleDisponibiliInOrizzontale && this.cells[i + this.parolaCorrente.length].letter == "white")
                this.insertHorizontalWord(i, true);
              else this.insertHorizontalWord(i, false);
            }
          } else this.alertCreator.createInfoAlert("ERRORE", "Non ci sono abbastanza caselle disponibili");

        }


      } else this.alertCreator.createInfoAlert("ERRORE!", "La parola deve contenere almeno due lettere!")
    });

    return await modal.present();
  }

  private getCaselleDisponibiliInVerticale(row, cellNumber, word) {
    var caselleDisponibili = 0;
    var i = 0;

    for (let index = row; index < this.dimensioni.value.altezza; index++) {

      if (this.cells[cellNumber].letter == "white") {
        i++;
        caselleDisponibili++;
      } else {
        if (this.cells[cellNumber].letter == "black") {
          return caselleDisponibili;
        }
        if (this.cells[cellNumber].letter == word[i]) {
          caselleDisponibili++;
          i++;
        } else return caselleDisponibili - 1;
      }
      cellNumber += this.dimensioni.value.larghezza;
    }
    return caselleDisponibili;
  }


  private getCaselleDisponibiliInOrizzontale(col, cellNumber, word) {
    var caselleDisponibili = 0;
    var i = 0;

    for (let index = col; index < this.dimensioni.value.larghezza; index++) {

      if (this.cells[cellNumber].letter == "white") {
        i++;
        caselleDisponibili++;
      } else {
        if (this.cells[cellNumber].letter == "black") {
          return caselleDisponibili;
        }
        if (this.cells[cellNumber].letter == word[i]) {
          caselleDisponibili++;
          i++;
        } else return caselleDisponibili - 1;
      }
      cellNumber++;
    }
    return caselleDisponibili;
  }

  /**
   * Inserisce la parola desiderata nel tabellone.
   * La parola verrà inserita in orizzontale
   * @param cellNumber posizione iniziale della parola
   * @param blackCell true se deve essere aggiunta una casella nera, false altrimenti
   */
  private insertHorizontalWord(cellNumber, blackCell) {
    this.insertQuestionNumber(cellNumber);
    for (let index = 0; index < this.parolaCorrente.length; index++) {
      const cell = document.getElementById("c" + cellNumber);
      const label = document.createElement("ion-label");
      label.textContent = this.parolaCorrente[index];
      cell.appendChild(label);

      this.cells[cellNumber].letter = this.parolaCorrente[index];
      cellNumber++;
    }
    if (blackCell)
      this.createBlackCell(cellNumber);
  }

  /**
   * Inserisce la parola desiderata nel tabellone.
   * La parola verrà inserita in verticale
   * @param cellNumber posizione iniziale della parola
   * @param blackCell true se deve essere aggiunta una casella nera, false altrimenti
   */
  private insertVerticalWord(cellNumber, blackCell) {
    this.insertQuestionNumber(cellNumber);
    for (let index = 0; index < this.parolaCorrente.length; index++) {
      const cell = document.getElementById("c" + cellNumber);
      const label = document.createElement("ion-label");
      label.textContent = this.parolaCorrente[index];
      cell.appendChild(label);

      this.cells[cellNumber].letter = this.parolaCorrente[index];
      cellNumber += this.dimensioni.value.larghezza;
    }
    if (blackCell)
      this.createBlackCell(cellNumber);
  }

  /**
   * Inserisce nella prima casella di una parola, il numero della domanda corrispondente.
   * Dopodichè il contatore viene incrementato di uno.
   * @param cellNumber posizione della casella in cui inserire il numero
   */
  private insertQuestionNumber(cellNumber) {
    const c = document.getElementById("c" + cellNumber);
    const label = document.createElement("ion-label");
    label.textContent = this.questionNumber.toString();
    this.questionNumber++;
    label.classList.add("question-number");
    c.appendChild(label);
  }

  /**
   * Crea una nuova riga del tabellone
   * @param currentRowNumber numero della nuova corrente
   * @returns la nuova riga
   */
  private createNewRow(currentRowNumber) {
    const newRow = document.createElement("tr");
    newRow.id = "row" + currentRowNumber;
    document.getElementById("table").appendChild(newRow);
    return newRow;
  }





}
