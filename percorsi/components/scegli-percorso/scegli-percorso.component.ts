import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { Timeouts } from 'selenium-webdriver';


import percorsiData from './file/percorsi.json';

interface Percorsi {
  "nome": string;
  "dim": Number;
  "tema": Array<string>;
  "codice": Array<string>;
}

@Component({
  selector: 'app-scegli-percorso',
  templateUrl: './scegli-percorso.component.html',
  styleUrls: ['./scegli-percorso.component.scss'],
})
export class ScegliPercorsoComponent implements OnInit {
  perc: string;
  percorsis: Percorsi[] = percorsiData;

  x: number;  //si muove in orizzontale 
  y: number;   //si muove in verticale 

  x_arrivo: number;
  y_arrivo: number

  //ad esempio se x = 0 ed y = 1, dobbiamo andare a prendere il bottone 10 

  btnPartenza;  //bottone da cui si parte 
  btnPuntatore; // bottone che indica dove si va a finire applicando una procedura 
  btnControllo; //bottone da controllare ad ogni passaggio (corrisponde al bottone successivo in base alla direzione al bottone di partenza )

  stampaRisultato: string = "Sei arrivato a destinazione: " //serve per salvarci il contenuto della stringa, quando arrivato a destinazione, che poi viene inviato alla home nella variabile ris 

  stampaErrore: string = " "; //serve per salvarci gli errori 

  bonus: number = 0;   //conta il numero dei bonus 

  stampaBonus: string = " "; //serve per stampare i bonus 

  

  @Output() newEventFinish = new EventEmitter<string>(); //er la stampa del risultato, evento in uscita verso il componente padre (home) 

  @Output() newEventError = new EventEmitter<string>(); // per la stampa degli errori

  @Output() newEventBonus = new EventEmitter<string>(); // per la stampa dei bonus


//per il risultato, se arrivato a destinazione 
  addNewItemFinish() {
    this.newEventFinish.emit(this.stampaRisultato);
  }

  //per stampare l'errore, ad esempio se uscito da griglia 
  addNewError() {
    this.newEventError.emit(this.stampaErrore);
  }

   //per stampare i bonus attraversati
   addNewBonus() {
    this.newEventBonus.emit(this.stampaBonus);
  }

  @Output() newItemEvent = new EventEmitter<number>();

  ngOnInit() { }

  sendDimToParent(value: number) {
    this.newItemEvent.emit(value);
  }


  //SCEGLI PERCORSO 
  scegliPercorso(perc) { //viene passata la variabile 'perc' che non è altro che il valore del nome del JSON e viene selezionato quel fato
 
    document.getElementById('controllaButton').removeAttribute('disabled');
    
    var scelta = percorsiData.find(item => item.nome == perc); //fa una select dai dati dove il nome è uguale a quello passato e assegna l'oggetto percorso alla var scelta
    this.sendDimToParent(scelta.dim);

    this.impostaYpartenza(this.perc); //imposto la y dal json 
    this.impostaXpartenza(this.perc); //imposto la x dal json
    document.getElementById("istruzioni").innerHTML = "Parti da: "+ scelta.partenza+"<br> Arriva a: "+scelta.arrivo;
    setTimeout(this.classifica,1,scelta);
  } //fine scegliPercorso 
  
 classifica(scelta){
   
    for (let i = 0; i <= 99; i++) {
      // var listaClassi = document.getElementById('button' + i).classList;
      //console.log(scelta.codice[i]);
      document.getElementById('button' + i).classList.add(scelta.codice[i]); //+ tema per personalizzare 
      document.getElementById('button' + i).setAttribute("type-square", scelta.codice[i]); //assegna al type-square le classi del json 

    
  }
}
  // funzione di controllo
  controlloX(n: number) {
    if ((this.x + n) > 9 || (this.x + n) < 0) {
      return false;
    }
  }
  controlloY(n: number) {
    if ((this.y + n) > 9 || (this.y + n) < 0) {
      return false;
    }
  }


  impostaXpartenza(perc) {
    var scelta = percorsiData.find(item => item.nome == perc);
    var partenzaString = scelta.partenza[0].charAt(1);
    var partenzaInt = parseInt(partenzaString);
    this.x = partenzaInt;

  }
  impostaYpartenza(perc) {
    var scelta = percorsiData.find(item => item.nome == perc);
    var partenzaString = scelta.partenza[0].charAt(0);
    var partenzaInt = parseInt(partenzaString);
    this.y = partenzaInt;
  }


  prendiXarrivo(perc) {
    var scelta = percorsiData.find(item => item.nome == perc);
    var arrivoString = scelta.arrivo[0].charAt(1);
    var arrivoInt = parseInt(arrivoString);
    //this.x = arrivoInt;
    this.x_arrivo = arrivoInt;
  }

  prendiYarrivo(perc) {
    var scelta = percorsiData.find(item => item.nome == perc);
    var arrivoString = scelta.arrivo[0].charAt(0);
    var arrivoInt = parseInt(arrivoString);
    this.y_arrivo = arrivoInt;
  }


  rightN(n: number) {    

    if (this.x == 9 ) {     
      this.stampaErrore += "errore uscita griglia destra";
       this.addNewError();
    }
    //se in 1° riga 
    if (this.y == 0) {
      this.btnPartenza = document.getElementById('button' + this.x); //bottone da cui si parte
    }
    else {
      this.btnPartenza = document.getElementById('button' + this.y + this.x); //bottone da cui si parte
    }
   this.btnPartenza.classList.add("rabbit");
  
    // CONTROLLO TUTTO PASSO PASSO
    for (let i = 1; i <= n; i++) {
      if (this.x + i > 9){
        document.getElementById('stampaErr').innerHTML+="Sei Uscito a Destra!"
        break;
      }
      if(this.x + i<=9){    
        if(this.y==0){
          this.btnControllo = document.getElementById('button'+(this.x + i))
        } else{
      this.btnControllo = document.getElementById('button' + this.y + (this.x + i))
        }
     
      if (this.btnControllo.getAttribute('type-square')=="free-box") {    // oppure...if (btnControllo.getAttribute("type-square") ==  "free-box") {
          this.btnControllo.classList.add("traverse"); //indica il bottone attraversato 
      }else if (this.btnControllo.getAttribute('type-square')=="danger-box") {
        this.btnControllo.classList.add("btn-error"); //aggiungo la classe per segnalare l'errore 
        
        break;
      }  else if (this.btnControllo.getAttribute('type-square')=="bonus-box") {
        this.bonus++;
        this.btnControllo.classList.add("traverse"); //aggiunta
      }    
    }
          
    } // chiusura for 
    
    this.x = this.x + n; 
  }


  leftN(n: number) {    
    if (this.x == 9 ) {     
      this.stampaErrore += "errore uscita griglia destra";
       this.addNewError();
    }
    //se in 1° riga 
    if (this.y == 0) {
      this.btnPartenza = document.getElementById('button' + this.x); //bottone da cui si parte
    }
    else {
      this.btnPartenza = document.getElementById('button' + this.y + this.x); //bottone da cui si parte
    }
   this.btnPartenza.classList.add("rabbit");
  
    // CONTROLLO TUTTO PASSO PASSO
    for (let i = 1; i <= n; i++) {
      if (this.x - i <0){
        document.getElementById('stampaErr').innerHTML+="Sei Uscito a Sinistra!"
        break;
      }
      else if(this.x - i<9){    
        if(this.y==0){
          this.btnControllo = document.getElementById('button'+(this.x - i))
        } else{
      this.btnControllo = document.getElementById('button' + this.y + (this.x - i))
        }
     
  
      if (this.btnControllo.getAttribute('type-square')=="free-box") {    // oppure...if (btnControllo.getAttribute("type-square") ==  "free-box") {
          this.btnControllo.classList.add("traverse"); //indica il bottone attraversato 
      }else if (this.btnControllo.getAttribute('type-square')=="danger-box") {
        this.btnControllo.classList.add("btn-error"); //aggiungo la classe per segnalare l'errore 
        
        break;
      }  else if (this.btnControllo.getAttribute('type-square')=="bonus-box") {
        this.bonus++;
        this.btnControllo.classList.add("traverse"); //aggiunta
      }    
    }
          
    } // chiusura for 
    
    this.x = this.x - n; 
  
  }




upN(n: number) {    

   //se sono in 10° riga non posso fare down 
  
   if (this.y == 0 ) {     
    this.stampaErrore += "errore uscita griglia in alto";
     this.addNewError();
  }
  //se in 1° riga 
  if (this.y == 0) {
    this.btnPartenza = document.getElementById('button' + this.x); //bottone da cui si parte
  }
  else {
    this.btnPartenza = document.getElementById('button' + this.y + this.x); //bottone da cui si parte
  }
 this.btnPartenza.classList.add("rabbit");

  // CONTROLLO TUTTO PASSO PASSO
  for (let i = 1; i <= n; i++) {
    if (this.y - i < 0){
      document.getElementById('stampaErr').innerHTML+="Sei Uscito in Alto!"
      break;
    }
    if(this.y - i!=0){     
    this.btnControllo = document.getElementById('button' + (this.y - i )+ this.x)
    }else if (this.y - i==0){
      this.btnControllo = document.getElementById('button' + this.x)}
   

    if (this.btnControllo.getAttribute('type-square')=="free-box") {    // oppure...if (btnControllo.getAttribute("type-square") ==  "free-box") {
        this.btnControllo.classList.add("traverse"); //indica il bottone attraversato 
    }else if (this.btnControllo.getAttribute('type-square')=="danger-box") {
      this.btnControllo.classList.add("btn-error"); //aggiungo la classe per segnalare l'errore 
      
      break;
    }  else if (this.btnControllo.getAttribute('type-square')=="bonus-box") {
      this.bonus++;
      this.btnControllo.classList.add("traverse"); //aggiunta
    }    

        
  } // chiusura for 
  
  this.y = this.y - n; 

}

downN(n: number) {    

  //se sono in 10° riga non posso fare down 
  
  if (this.y == 9 ) {     
    this.stampaErrore += "errore uscita griglia in basso";
     this.addNewError();
  }
  //se in 1° riga 
  if (this.y == 0) {
    this.btnPartenza = document.getElementById('button' + this.x); //bottone da cui si parte
  }
  else {
    this.btnPartenza = document.getElementById('button' + this.y + this.x); //bottone da cui si parte
  }
 this.btnPartenza.classList.add("rabbit");

  // CONTROLLO TUTTO PASSO PASSO
  for (let i = 1; i <= n; i++) {
    if (this.y + i > 9){
      document.getElementById('stampaErr').innerHTML+="Sei Uscito in basso!"
      break;
    }
    if(this.y + i!=0){     
    this.btnControllo = document.getElementById('button' + (this.y + i )+ this.x)
    }else if (this.y + i==0){
      this.btnControllo = document.getElementById('button' + this.x)}
   

    if (this.btnControllo.getAttribute('type-square')=="free-box") {    // oppure...if (btnControllo.getAttribute("type-square") ==  "free-box") {
        this.btnControllo.classList.add("traverse"); //indica il bottone attraversato 
    }else if (this.btnControllo.getAttribute('type-square')=="danger-box") {
      this.btnControllo.classList.add("btn-error"); //aggiungo la classe per segnalare l'errore 
      
      break;
    }  else if (this.btnControllo.getAttribute('type-square')=="bonus-box") {
      this.bonus++;
      this.btnControllo.classList.add("traverse"); //aggiunta
    }    

        
  } // chiusura for 
  
  this.y = this.y + n; 
}






  //--------- CONTROLLA PERCORSO------------------
  controllaPercorso(perc) {

    //SCORRO INPUT-DIREZIONE 
    let contaInput = parseInt(localStorage.getItem("numeroIstruzioni"));
    //conta gli input


    for (let i = 1; i <= contaInput; i++) {
      try {
        var value = document.querySelector<HTMLInputElement>('#input' + i).value; //prendo il valore dell'input
      } catch (error) {
        continue;
      }

      var numberValue = parseInt(value);   //trasformo da string a number 


      var direzione = document.getElementById('b' + i).getAttribute("direzione"); //prendo la direzione scelta


      if (direzione == "su")
        this.upN(numberValue);
      else if (direzione == "giu")
        this.downN(numberValue)
      else if (direzione == "destra")
        this.rightN(numberValue)
      else if (direzione == "sinistra")
        this.leftN(numberValue)
    }

    //stampa il risultato 

    this.prendiYarrivo(this.perc);
    this.prendiXarrivo(this.perc);


    //controllo se la x ed la y di arrivo del personaggio corrispondono a quelle prese dal json
    if (this.y == this.y_arrivo && this.x == this.x_arrivo) {
      document.getElementById('button' + this.y +  this.x).classList.add ("finish");
      document.getElementById('stampaBonus').innerHTML+="Hai preso "+this.bonus+"bonus";
      this.btnPuntatore.classList.add("finish"); 
      //richiamo il metodo per trasferire il risultato al componente padre (cioè alla home.page.html)
      this.addNewItemFinish();

      //stampo i bonus presi durante il percorso 
   /*  this.stampaBonus = "Hai preso "+this.bonus+ ' ' + " bonus" ;  //'' serve per convertire un numero in stringa

    this.addNewBonus(); */
    }

    

  }

//ritorna alla griglia di default 
  pulisciPercorso(){

    
   //eliminazione delle classi, quindi si torna a quelle di default nel json 
    for (let i = 0; i <= 99; i++) {
   
    let btn = document.getElementById('button' + i );
    var listaClassi = btn.classList;
    listaClassi.remove("traverse","btn-error","rabbit","finish"); //rimozione delle classi 

    //azzeramento delle variabili, cioè ripartenza da 0 
    this.y = 0;
    this.x = 0;

    //azzeramento delle stampe 
    this.stampaRisultato = ''
    this.addNewItemFinish();
    this.stampaBonus= ''
    this.addNewBonus();
    this.stampaErrore = '';
    this.addNewError();
    document.getElementById("stampaErr").innerHTML="";
    document.getElementById("stampaBonus").innerHTML="";
    document.getElementById("stampaArrivo").innerHTML="";
    
  }
}

}





