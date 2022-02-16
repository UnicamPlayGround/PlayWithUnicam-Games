import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Question } from 'src/app/modal-pages/question-modal/question';

@Component({
  selector: 'app-create-quiz-question',
  templateUrl: './create-quiz-question.page.html',
  styleUrls: ['./create-quiz-question.page.scss'],
})
export class CreateQuizQuestionPage implements OnInit {
  pageTitle = "Nuova domanda";
  @Input() newQuestion: Question;
  title: String = "";
  text: String = "";
  url: String = "";
  question: Question = new Question("", [], "", "", 10);
  questionCountdown: string = new Date("2022-01-01T00:00:10").toISOString();

  constructor(private modalCtrl: ModalController, private navParams: NavParams) { }

  ngOnInit() {
    this.newQuestion = this.navParams.get('question');

    if (this.newQuestion) {
      this.pageTitle = "Modifica domanda";
      // this.title = this.newQuestion.title;
      // this.text = this.newQuestion.text;
      // this.url = this.newQuestion.url;
      // this.question = new Question(
      //   this.newQuestion.question.question,
      //   [],
      //   this.newQuestion.question.imgUrl,
      //   this.newQuestion.question.videoUrl,
      //   this.newQuestion.question.countdownSeconds
      // );

      // this.newQuestion.question.answers.forEach(a => {
      //   this.question.answers.push(a);
      // })

      // var date = new Date(null);
      // date.setSeconds(this.newQuestion.question.countdownSeconds);
      // this.questionCountdown = date.toISOString();
    }
  }

  createQuestion() {
    var date = new Date(this.questionCountdown);
    this.question.countdownSeconds = (date.getMinutes() * 60) + date.getSeconds();

    // if (this.newMemoryCard) {
    //   this.newMemoryCard.title = this.title;
    //   this.newMemoryCard.text = this.text;
    //   this.newMemoryCard.url = this.url;
    //   this.newMemoryCard.question = this.question;
    // } else {
    //   this.newMemoryCard = new MemoryCard(this.title, this.text, this.url, this.question);
    // }

    // this.modalCtrl.dismiss(this.newMemoryCard);
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
