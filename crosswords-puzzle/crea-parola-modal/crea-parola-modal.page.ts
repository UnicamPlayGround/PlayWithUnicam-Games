import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-crea-parola-modal',
  templateUrl: './crea-parola-modal.page.html',
  styleUrls: ['./crea-parola-modal.page.scss'],
})
export class CreaParolaModalPage implements OnInit {

  @Input() parola: string;
  @Input() definizione: string;
  @Input() orientamento: string;



  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
  ) { }

  ngOnInit() {
    this.parola = this.navParams.get('parola');
    this.definizione = this.navParams.get('definizione');
    this.orientamento = this.navParams.get('orientamento');
  }

  closeModal() {
    const data = {
      'parola' : this.parola,
      'definizione' : this.definizione,
      'orientamento' : this.orientamento
    }
    this.modalController.dismiss(data);
  }

}
