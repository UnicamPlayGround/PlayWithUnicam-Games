import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameEditorComponent } from 'src/app/components/game-editor/game-editor.component';
import { Question } from 'src/app/modal-pages/question-modal/question';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { CreateQuizQuestionPage } from '../create-quiz-question/create-quiz-question.page';

@Component({
  selector: 'app-quiz-editor',
  templateUrl: './quiz-editor.page.html',
  styleUrls: ['./quiz-editor.page.scss'],
})
export class QuizEditorPage implements OnInit, GameEditorComponent {
  questions: Question[] = [];
  bulkEdit = false;
  edit = {};

  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('config') config: any = {};

  constructor(private alertCreator: AlertCreatorService, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.questions = [
      new Question("Che anno è?", ["2022", "2021", "2020"], "", "", 10),
      new Question("Che mese è?", ["Febbraio", "Marzo", "Aprile"], "", "", 15),
      new Question("Che giorno è?", ["Martedì", "Mercoledì", "Giovedì"], "", "", 20),
      new Question("Che ora è?", ["Le 16:00", "Le 17:00", "Le 18:00"], "", "", 25),
    ]
  }

  /**
   * Abilita il selezionamento multiplo degli elementi per l'eliminazione.
   */
  toggleBulkEdit() {
    this.bulkEdit = !this.bulkEdit;
    this.edit = {};
  }

  /**
* Controlla se ci sono carte selezionate tramite le checkbox.
* 
* @returns true se almeno un elemento è selezionato, false altrimenti
*/
  checkSelectedQuestions() {
    var selected = false;
    let keys = Object.keys(this.edit);
    while (keys.length) {
      if (this.edit[keys.pop()]) selected = true;
    }
    return selected;
  }

  /**
   * Elimina le carte selezionate.
   */
  deleteSelectedQuestions() {
    let toDelete = Object.keys(this.edit);
    const indexesToDelete = toDelete.filter(index => this.edit[index]).map(key => +key);

    while (indexesToDelete.length) {
      const i = indexesToDelete.pop();
      this.questions.splice(i, 1);
      if (this.config.questions)
        this.config.questions.splice(i, 1);
    }
  }

  /**
   * Se la selezione caselle è abilitata, elimina solo le carte selezionate, se ve ne sono,
   * altrimenti mostra un errore.
   */
  bulkDelete() {
    if (this.bulkEdit) {
      if (this.edit && Object.keys(this.edit).length != 0 && this.edit.constructor === Object && this.checkSelectedQuestions())
        this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare le domande selezionate?", () => {
          this.deleteSelectedQuestions();
          this.toggleBulkEdit();
        });
      else this.alertCreator.createInfoAlert('Errore', 'Seleziona prima qualche elemento!');
    }
  }

  /**
   * Apre la modal per la creazione di una nuova carta.
   */
  async addQuestion() {
    const modal = await this.modalCtrl.create({
      component: CreateQuizQuestionPage,
      cssClass: 'create-lobby'
    });

    modal.onDidDismiss().then((data) => {
      const newQuestion = data['data'];

      if (newQuestion) {
        this.questions.push(newQuestion);
        if (!this.config.questions)
          this.config.questions = [];
        this.config.questions.push(newQuestion.getJSON());
      }
    });

    await modal.present();
  }

  editQuestion(question: Question) {
  }

  deleteQuestion() {

  }

}
