import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  n: number = 0;  //numero di righe/colonne 
  buttons;
  temaClasses: string[] = ["auto"];
  direz: string
  num: number = 1;

  contaIstruzioni: number = 1; //utilizzata per contare le istruzioni 
  contaBtn: number = 1; // utilizzata per scorrere i bottoni all'interno dell'input-direzione dinamico 

  ris: string;   //risultato (serve per salvarci il contenuto della stringa, quando arrivato a destinazione )
  err: string;   //serve per salvarci l'errore, ad esempio se si esce dalla griglia 
  bonus: string //serve per salvarci il numero dei bonus attraversati lungo il percorso 

  static contaIstruzioni: any;

  //stampa del risultato cioè se si arriva al bottone di destinazione 
  addItem(newItem: string) {
    this.ris = newItem;
  }

  //serve per la stampa dell'errore, ad esempio se si esce dalla griglia 
  addError(newItem: string) {
    this.err = newItem;
  }

  //serve per la stampa dei bonus a fine percorso 
  addBonus(newItem: string) {
    this.bonus = newItem;
  }

  getDim(dim: number) {
    this.n = dim;
    this.buttons = Array.from(Array(this.n * this.n).keys());
  }




  addInputButton() {
    this.contaIstruzioni++;
    localStorage.setItem('numeroIstruzioni', this.contaIstruzioni.toString());
    var paragrafo = document.createElement("ion-item");
    paragrafo.setAttribute("id", "p" + this.contaIstruzioni);
    var button = document.createElement("ion-button");
    button.innerHTML = 'DIREZIONE';
    button.className = 'bottoneDirez';
    button.setAttribute("id", "b" + this.contaIstruzioni)
    var conta = this.contaIstruzioni; 
    button.onclick = () => this.cambioDirezione('b' + conta);
    var indice = 1
    var input = document.createElement("ion-input");
    input.type = 'number';
    input.value = 1;
    input.setAttribute("id", "input" + this.contaIstruzioni);
    input.setAttribute("min", "1");

    var button2 = document.createElement("ion-button");
    button2.innerHTML = 'ELIMINA';
    button2.className = 'bottoneDirezElimina';
  
    button2.onclick = () => this.eliminaRiga('p'+conta)
    paragrafo.appendChild(input);
    paragrafo.appendChild(button);
    paragrafo.appendChild(button2);
    
    document.getElementById("input-direzione").appendChild(paragrafo);
    this.contaBtn++;
  }

  //elimina l'input-direzione 1 (quello di default a video)
   eliminaInputDirez1(){
  let node = document.getElementById("item1");
  node.remove();
 }

 eliminaRiga(parag: string){
  let node = document.getElementById(parag);
  node.remove();

 }

//CAMBIA LA VARIABILE DI DIREZIONE SELEZIONATA
  impostaDirezione(direz) {
    localStorage.setItem('direzSelect', direz);
  }

  //PERMETTE DI CAMBIARE LA DIREZIONE DELLA FRECCIA 
  cambioDirezione(n: string) {
    var direzSelect = localStorage.getItem('direzSelect'); //la direzione selezionata
    var btn = document.getElementById(n); //prende elemento tramite id
    try {
      btn.classList.remove(...this.temaClasses);
    } catch (error) {}
    btn.classList.add(direzSelect);
    btn.setAttribute("direzione", direzSelect);
    btn.innerText = direzSelect; //serve per cambiare ii nome del bottone con la variabile locale 

  }


}




