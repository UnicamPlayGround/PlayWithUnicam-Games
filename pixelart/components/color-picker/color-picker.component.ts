import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {

  colore: string; 

  constructor() { }

  ngOnInit() {

  }
  //Serve per cambiare il colore, utilizzando la localStorage
 
  impostaColore(colore) {
    
  //crea variabile colorSelect
  localStorage.setItem('colorSelect', colore);
  try {
    document.getElementsByClassName('color-select')[0].classList.remove('color-select')
  } catch (error) {
    
  }
  
  document.getElementById('tavolozza-'+colore).classList.add('color-select')
}


}
