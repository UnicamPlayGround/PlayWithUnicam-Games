import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameEditorComponent } from 'src/app/components/game-editor/game-editor.component';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { CreateQuizQuestionPage } from '../create-quiz-question/create-quiz-question.page';
import { QuizQuestion } from '../quiz-question';

@Component({
  selector: 'app-quiz-editor',
  templateUrl: './quiz-editor.page.html',
  styleUrls: ['./quiz-editor.page.scss'],
})
export class QuizEditorPage implements OnInit, GameEditorComponent {
  questions: QuizQuestion[] = [];
  bulkEdit = false;
  edit = {};

  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('config') config: any = {};

  constructor(private alertCreator: AlertCreatorService, private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.config.questions) {
      this.config.questions.forEach(question => {
        this.questions.push(
          new QuizQuestion(
            question.question,
            question.answers,
            question.img_url,
            question.video_url,
            question.countdown_seconds,
            question.score
          ));
      });
    }
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

  async editQuestion(question: QuizQuestion, index: number) {
    if (!this.bulkEdit) {
      const modal = await this.modalCtrl.create({
        component: CreateQuizQuestionPage,
        componentProps: {
          question: question
        },
        cssClass: 'lobby-pubbliche'
      });

      modal.onDidDismiss().then((data) => {
        const newQuizQuestion = data['data'];

        if (newQuizQuestion) {
          this.config.questions[index] = newQuizQuestion.getJSON();
          this.questions[index] = newQuizQuestion;
        }
      });

      await modal.present();
    }
  }

  deleteQuestion(question: QuizQuestion, index: number) {
    this.questions.splice(index, 1);
    if (this.config.questions)
      this.config.questions.splice(index, 1);
  }

}
