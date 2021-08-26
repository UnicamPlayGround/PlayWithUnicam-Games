import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-goose-game',
  templateUrl: './goose-game.page.html',
  styleUrls: ['./goose-game.page.scss'],
})
export class GooseGamePage implements OnInit {


  constructor() { }

  ngOnInit() {
  }

  muoviPedina(direzione) {
    console.log(direzione);
    var step = 50;
    switch (direzione) {
      case "down":
        var x = document.getElementById('i1').offsetTop + step;
        document.getElementById('i1').style.top = x + "px";
        break;
      case "up":
        var x = document.getElementById('i1').offsetTop - step;
        document.getElementById('i1').style.top = x + "px";
        break;
      case "left":
        var y = document.getElementById('i1').offsetLeft - step;
        document.getElementById('i1').style.left = y + "px";
        break;
      case "right":
        var y = document.getElementById('i1').offsetLeft + step;
        document.getElementById('i1').style.left = y + "px";
        break;
    }
  }

  lanciaDado() {
    const lancio = Math.floor(Math.random() * 6) + 1;
    console.log(lancio);
    var immagineDado = <HTMLInputElement>document.getElementById("cubo")
    //TODO rivedere la posizione degli assets
    immagineDado.src = "../../../assets/game-assets/dado" + lancio + ".png";
  }

}