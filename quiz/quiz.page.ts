import { Component, OnInit, Inject, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomController } from '@ionic/angular';
import { Question } from 'src/app/modal-pages/question-modal/question';
import { Timer } from 'src/app/components/timer-components/timer';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage implements OnInit {
  score: number = 0;
  questions: Question[] = [];
  shuffledAnswers: String[] = [];
  activeQuestion: Question;
  selectedAnswer: String;
  timer: Timer = new Timer(30, false, () => { this.timer.stopTimer(); this.setActiveQuestion(); });
  disableAnswers = false;

  @ViewChild('scoreEl') scoreEl: ElementRef;

  backgrounds = [
    '#1abc9c',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#bdc3c7',
    '#27ae60',
    '#f39c12',
    '#c0392b'
  ];

  constructor(private domCtrl: DomController, private renderer: Renderer2, @Inject(DOCUMENT) private document) { }

  ngOnInit() {
    this.questions = [
      new Question("Che ora è?", ["Le 13:00", "Le 12:00", "Le 14:00"], "", "", 10),
      new Question("Che giorno è?", ["Mercoledì", "Lunedì", "Venerdì"], "", "", 10),
      new Question("Che mese è?", ["Febbraio", "Marzo", "Dicembre"], "", "", 10),
      new Question("Che anno è?", ["2022", "2021", "2020"], "", "", 10),
      new Question("Dove siamo?", ["Castelraimondo", "Camerino", "Cingoli"], "", "", 10),
      new Question("Chi siamo?", ["Bella domanda", "Persone", "Alieni"], "", "", 10),
      new Question("Perché siamo?", ["Non si sa", "Perché sì", "Dobbiamo"], "", "", 10),
      new Question("Dove andiamo?", ["Chi lo sa?", "Avanti", "Indietro"], "", "", 10),
    ];
    // this.questions = [
    //   { question: "Che ora è?", background: '#1abc9c' },
    //   { question: "Che giorno è?", background: '#3498db' },
    //   { question: "Che mese è?", background: '#9b59b6' },
    //   { question: "Che anno è?", background: '#34495e' },
    //   { question: "Dove siamo?", background: '#bdc3c7' },
    //   { question: "Chi siamo?", background: '#27ae60' },
    //   { question: "Perché siamo?", background: '#f39c12' },
    //   { question: "Dove andiamo?", background: '#c0392b' }
    // ];

    this.setActiveQuestion();
  }

  setActiveQuestion() {
    this.selectedAnswer = null;
    this.disableAnswers = false;
    let selectedQuestionIndex = Math.floor(Math.random() * this.questions.length);
    this.activeQuestion = this.questions[selectedQuestionIndex];
    this.setAnswers();
    this.shuffleAnswers();
    // this.timer.setTimerTime(this.questions[selectedQuestionIndex].countdownSeconds);
    // this.timer.startTimer();

    this.domCtrl.write(() => {
      this.document.documentElement.style.setProperty('--ion-background-color', this.backgrounds[Math.floor(Math.random() * this.backgrounds.length)]);
    });
  }

  /**
   * Inserisce le risposte di una determinata domanda all'interno dell'array 'shuffledAnswers'
   */
  setAnswers() {
    this.shuffledAnswers = [];
    for (let index = 0; index < this.activeQuestion.answers.length; index++) {
      this.shuffledAnswers.push(this.activeQuestion.answers[index]);
    }
  }

  /**
   * Mescola le domande da mostrare sulla modal
   */
  shuffleAnswers() {
    for (var i = this.shuffledAnswers.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = this.shuffledAnswers[i];
      this.shuffledAnswers[i] = this.shuffledAnswers[j];
      this.shuffledAnswers[j] = temp;
    }
  }

  selectAnswer(answer: string) {
    this.selectedAnswer = answer;
    this.disableAnswers = true;

    if (this.selectedAnswer == this.activeQuestion.answers[0]) {
      this.score++;

      this.renderer.setAttribute(this.scoreEl.nativeElement, 'transform', 'scale(1.5)');

      // this.domCtrl.write(() => {
      //   this.scoreEl.nativeElement.style.setProperty('transform', 'scale(1.5)');
      // });

      setInterval(() => {
        this.domCtrl.write(() => {
          this.scoreEl.nativeElement.style.setProperty('transform', 'scale(1)');
        });
        // this.renderer.setAttribute(this.scoreEl.nativeElement, 'transform', 'scale(1)');
      }, 500);
    }

    setTimeout(() => {
      this.setActiveQuestion();
    }, 3000);
  }

}
