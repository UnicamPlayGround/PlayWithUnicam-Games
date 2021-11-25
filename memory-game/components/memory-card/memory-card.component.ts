import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MemoryDataKeeperService } from '../../services/data-keeper/data-keeper.service';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrls: ['./memory-card.component.scss'],
})
export class MemoryCardComponent implements OnInit, AfterViewInit {
  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('card') card = { title: "", text: "", url: "" };
  /**
   * Questo EventEmitter consente a questo component di comunicare con il suo parent emettendo
   * eventi contenenti determinati valori che saranno poi intercettati dal parent.
   */
  @Output() updateConfigEvent = new EventEmitter<Object>();

  covered = true;

  @ViewChild('flippetefloppete', { static: false }) flippetefloppete: ElementRef;
  @ViewChild('inner') inner: ElementRef;

  constructor(private dataKeeper: MemoryDataKeeperService) { }

  ngAfterViewInit(): void {
    this.flippetefloppete.nativeElement.addEventListener('click', () => { this.flipCard() });
    console.log(this.card);

  }

  ngOnInit() { }

  flipCard() {
    if (this.dataKeeper.getTurn()) {
      if (this.covered) {
        this.inner.nativeElement.style.transform = "rotateY(180deg)";
        this.covered = !this.covered;
        console.log(this.covered);
      } else {
        this.inner.nativeElement.style.transform = "rotateY(0deg)";
        this.covered = !this.covered;
        console.log(this.covered);
      }
    }
  }
}
