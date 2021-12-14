import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
import { Timer } from 'src/app/components/timer/timer';
import { MemoryCard } from '../../components/memory-card';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-card-question',
  templateUrl: './card-question.page.html',
  styleUrls: ['./card-question.page.scss'],
})
export class CardQuestionPage implements OnInit {

  card: MemoryCard;
  answers = [];
  rispostaSelezionata = false;
  rispostaCorretta = false;
  timer = new Timer(10, () => { this.closeModal() }, true);

  constructor(
    private navParams: NavParams,
    private modalController: ModalController) { }

  ngOnInit() {
    this.card = this.navParams.get('card');
    this.getAnswers();
    this.shuffleAnswers();
  }

  /**
 * Inserisce le risposte di una determinata domanda all'interno dell'array 'answers'
 */
  getAnswers() {
    // for (let index = 0; index < this.card.answers.length; index++)
    //   this.answers.push(this.card.answers[index]);
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

  radioGroupChange(event) {
    // if (event.detail.value === this.card.answers[0]) {
    //   document.getElementById(event.detail.value).classList.add("correct-answer");
    //   this.rispostaSelezionata = true;
    //   this.rispostaCorretta = true;
    //   this.timer.enabled = false;
    // }
    // else {
    //   document.getElementById(event.detail.value).classList.add("wrong-answer");
    //   document.getElementById(this.card.answers[0]).classList.add("correct-answer");
    //   this.rispostaSelezionata = true;
    //   this.rispostaCorretta = false;
    //   this.timer.enabled = false;
    // }
  }

  /**
* Chiude la modal passando true se l'utente ha risposto correttamente alla domanda, 
* false altrimenti.
*/
  closeModal() {
    this.timer.enabled = false;
    this.modalController.dismiss(this.rispostaCorretta);
  }

}
