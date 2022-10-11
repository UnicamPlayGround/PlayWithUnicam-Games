import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import disegniData from './file/disegni.json';
interface Disegni {
  "nome": string;
  "dim": Number;
  "tavolozza": Array<string>;
  "codice": Array<string>;
}


@Component({
  selector: 'app-scegli-disegno',
  templateUrl: './scegli-disegno.component.html',
  styleUrls: ['./scegli-disegno.component.scss'],
})
export class ScegliDisegnoComponent implements OnInit {
  dis: string;
  colorClasses: string[] = ["rosso", "verde", "giallo", "blu", "azzurro", "nero", "marrone", "arancione", "grigio", "viola", "bianco", "pix-error"];

  constructor() {

  }

  disegnis: Disegni[] = disegniData;
  @Output() newItemEvent = new EventEmitter<number>();

  ngOnInit() {
  }

  sendDimToParent(value: number) {
    this.newItemEvent.emit(value);
  }

  scegliColore(colore) {
    localStorage.setItem("colorSelect", document.getElementById(colore).getAttribute("pixel-color"));
  }

  scegliDisegno(dis) { //viene passata la variabile dis che non è altro che il valore del nome del JSOn e viene selezionato quel fato
    //pulisce tutto prima di effettuare un nuovo disegno
    document.getElementById('controllaButton').removeAttribute('disabled')
    try {
      let i: number;

      for (i = 0; i <= 99; i++) {
        var listaClassi = document.getElementById('button' + i).classList;

        listaClassi.remove(...this.colorClasses); //rimozione delle classi 
      }
    } catch (error) {

    }

    // document.getElementById("pixel-content").innerHTML = '';
    document.getElementById("tavolozza").innerHTML = '';
    for(let k=1;k<=10;k++){
    document.getElementById("codice"+k).innerHTML = k+': ';
    }



    let scelta = disegniData.find(item => item.nome == dis); //fa come una select dai dati dove il nome è uguale a quello passato e assegna l'oggeto disegno alla var scelta
    let n = scelta.dim; // per comodità passo il campo dim (dimensione griglia) an
    this.sendDimToParent(scelta.dim);
    //---------stampa codice-----------------------------------------------------------//
    let parola;
    let c = 0;
    for (let i = 0; i < 10; i++) {
      parola = scelta.codice[i * 10];

      for (let j = 0; j < 10; j++) {
        if (parola == scelta.codice[j + i * 10]) {
          c++;
        } else {
          document.getElementById('codice' + (i + 1)).innerHTML += c + '' + parola.charAt(0) + ' - ';
          parola = scelta.codice[j + i * 10];
          c = 1;
        }
        if (j == 9 && c >= 1) {
          document.getElementById('codice' + (i + 1)).innerHTML += c + '' + parola.charAt(0);
        }
      }

      c = 0;
    }
 //-------- FINE SCEGLI DISEGNO-----------------
    //--------------------------STAMPA LEGGENDA colori-------------------------//
    let k;
    for (k = 0; k < scelta.tavolozza.length; k++) {
      document.getElementById("tavolozza").innerHTML += scelta.tavolozza[k].charAt(0) + '=' + scelta.tavolozza[k] + ' ';
    }
  }

 
  //--------- CONTROLLA DISEGNO------------------
  controllaDisegno(dis) {
    let scelta = disegniData.find(item => item.nome == dis)
    let n = scelta.dim;
    let error = 0;
    let r = 0;// i e j mi servono per ciclare la matrice, r invece mi serve per scorrere linearmente il codice dei colori
    for (let i = 0; i < n * n; i++) {
      if (scelta.codice[i] != document.getElementById('button' + i).getAttribute("pixel-color")) {
        document.getElementById('button' + i).classList.add("pix-error",)
        error++;
        r++;
      } else {
        // scorro il contatore r
        r++;
      }
    }
  }

}

