import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameEditorComponent } from 'src/app/components/game-editor/game-editor.component';
import { Question } from 'src/app/modal-pages/question-modal/question';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { CreateCardPage } from '../create-card/create-card.page';
import { MemoryCard } from '../memory-card';

@Component({
  selector: 'app-memory-game-editor',
  templateUrl: './memory-game-editor.page.html',
  styleUrls: ['./memory-game-editor.page.scss'],
})
export class MemoryGameEditorPage implements OnInit, GameEditorComponent {
  memoryCards: MemoryCard[] = [];
  bulkEdit = false;
  edit = {};

  /**
   * Il valore della variabile config viene ottenuto dal component padre di questo editor.
   */
  @Input('config') config: any = { cards: [] };

  constructor(private modalController: ModalController, private alertCreator: AlertCreatorService) { }

  ngOnInit() {
    if (this.config.cards) {
      this.config.cards.forEach(card => {
        this.memoryCards.push(
          new MemoryCard(
            card.title, card.text, card.url,
            new Question(
              card.question.question,
              card.question.answers,
              card.question.img_url,
              card.question.video_url,
              card.question.countdown_seconds
            )
          ));
      });
    }

  }

  /**
   * Apre la modal per la creazione di una nuova carta.
   */
  async addNewCard() {
    const modal = await this.modalController.create({
      component: CreateCardPage,
      cssClass: 'lobby-pubbliche'
    });

    modal.onDidDismiss().then((data) => {
      const newMemoryCard = data['data'];

      if (newMemoryCard) {
        this.memoryCards.push(newMemoryCard);
        this.config.cards.push(newMemoryCard.getJSON());
      }
    });

    await modal.present();
  }

  /**
   * Apre la modal per la modifica della carta selezionata.
   * 
   * @param card La carta da modificare
   */
  async editCard(card: MemoryCard, index: number) {
    if (!this.bulkEdit) {
      const modal = await this.modalController.create({
        component: CreateCardPage,
        componentProps: {
          memoryCard: card
        },
        cssClass: 'lobby-pubbliche'
      });

      modal.onDidDismiss().then((data) => {
        const newMemoryCard = data['data'];

        if (newMemoryCard) {
          this.config.cards[index] = newMemoryCard.getJSON();
        }
      });

      await modal.present();
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
  checkSelectedCells() {
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
  deleteSelectedCells() {
    let toDelete = Object.keys(this.edit);
    const indexesToDelete = toDelete.filter(index => this.edit[index]).map(key => +key);

    while (indexesToDelete.length) {
      this.memoryCards.splice(indexesToDelete.pop(), 1);
    }
  }

  /**
   * Se la selezione caselle è abilitata, elimina solo le carte selezionate, se ve ne sono,
   * altrimenti mostra un errore.
   */
  bulkDelete() {
    if (this.bulkEdit) {
      if (this.edit && Object.keys(this.edit).length != 0 && this.edit.constructor === Object && this.checkSelectedCells())
        this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare le carte selezionate?", () => {
          this.deleteSelectedCells();
          this.toggleBulkEdit();
        });
      else this.alertCreator.createInfoAlert('Errore', 'Seleziona prima qualche elemento!');
    }
  }
}
