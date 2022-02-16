import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { QuizQuestion } from '../quiz-question';

@Component({
  selector: 'app-create-quiz-question',
  templateUrl: './create-quiz-question.page.html',
  styleUrls: ['./create-quiz-question.page.scss'],
})
export class CreateQuizQuestionPage implements OnInit {
  pageTitle = "Nuova domanda";
  @Input() newQuizQuestion: QuizQuestion;
  question: QuizQuestion = new QuizQuestion("", [], "", "", 10, 1);
  questionCountdown: string = new Date("2022-01-01T00:00:10").toISOString();

  constructor(private modalCtrl: ModalController, private navParams: NavParams) { }

  ngOnInit() {
    this.newQuizQuestion = this.navParams.get('question');

    if (this.newQuizQuestion) {
      this.pageTitle = "Modifica domanda";
      this.question = new QuizQuestion(
        this.newQuizQuestion.question,
        [],
        this.newQuizQuestion.imgUrl,
        this.newQuizQuestion.videoUrl,
        this.newQuizQuestion.countdownSeconds,
        this.newQuizQuestion.score
      );

      this.newQuizQuestion.answers.forEach(a => {
        this.question.answers.push(a);
      })

      var date = new Date(null);
      date.setSeconds(this.newQuizQuestion.countdownSeconds);
      this.questionCountdown = date.toISOString();
    }
  }

  createQuestion() {
    var date = new Date(this.questionCountdown);
    this.question.countdownSeconds = (date.getMinutes() * 60) + date.getSeconds();

    if (this.newQuizQuestion) {
      this.newQuizQuestion = this.question;
    } else {
      this.newQuizQuestion = new QuizQuestion(this.question.question, this.question.answers, this.question.imgUrl, this.question.videoUrl, this.question.countdownSeconds, this.question.score);
    }

    this.modalCtrl.dismiss(this.newQuizQuestion);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  /**
   * Fa sì che gli <ion-input> corrispondenti alle domande/risposte di ogni elemento non vengano
   * renderizzate ad ogni nuova digitazione.
   * 
   * @param index L'indice dell'elemento che si sta modificando.
   * @param item 
   * @returns 
   */
  trackEditList(index, item) {
    return index;
  }

  addAnswer() {
    this.question.answers.push("");
  }

  /**
   * Elimina una data risposta dalla casella selezionata.
   * @param answerIndex L'indice della risposta da eliminare.
   */
  deleteAnswer(answerIndex) {
    this.question.answers.splice(answerIndex, 1);
  }

}
