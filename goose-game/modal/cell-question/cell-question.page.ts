import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
} 

@Component({
  selector: 'app-cell-question',
  templateUrl: './cell-question.page.html',
  styleUrls: ['./cell-question.page.scss'],
})
export class CellQuestionPage implements OnInit {
  nCasella;
  question: any;
  answers = [];
  //trustedDashboardUrl : SafeUrl;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.nCasella = this.navParams.get('nCasella');
    this.question = this.navParams.get('question');
    this.getAnswers();
    this.shuffleAnswers();
  }

  /**
   * Inserisce le risposte di una determinata domanda all'interno dell'array 'answers'
   */
  getAnswers(){
    for (let index = 0; index <this.question.answers.length; index++)
      this.answers.push(this.question.answers[index]);
  }

  /**
   * Mescola le domande da mostrare sulla modal
   */
  shuffleAnswers() {
    for (var i = this.answers.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = this.answers[i];
      this.answers[i] = this.answers[j];
      this.answers[j] = temp;
    }
  }

  /**
   * Fornisce la risposta giusta alla domanda presentata sulla modal caricando le opportune classi da css.
   * Se la risposta data dall'utente è corretta, sarà evidenziata in verde,
   * altrimenti verrà evidenziata in rosso mentre la risposta giusta verrà evidenziata in verde.
   * @param event 
   */
  radioGroupChange(event) {
    console.log("radioGroupChange", event.detail);
    if (event.detail.value === this.question.answers[0]) {
      document.getElementById(event.detail.value).classList.add("correct-answer");
      this.modalController.dismiss(true);
    }
    else {
      document.getElementById(event.detail.value).classList.add("wrong-answer");
      document.getElementById(this.question.answers[0]).classList.add("correct-answer");
      this.modalController.dismiss(false);
    }
  }

  /**
   * Chiude la modal
   */
  closeModal() {
    this.modalController.dismiss();
  }

  // photoURL() {
  //   return this.transform(this.question.video_url);
  // }

  // transform(url) {
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  // }
}
