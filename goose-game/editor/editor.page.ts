import { Component, OnInit } from '@angular/core';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
})
export class EditorPage implements OnInit {
  cells = [];
  expandedCell: Number;
  bulkEdit = false;
  edit = {};
  config = {
    cells: [
      {
        title: "0"
      },
      {
        title: "1",
        question: {
          img_url: "https://m.media-amazon.com/images/I/71bqA2Ee-lL._AC_SY450_.jpg",
          video_url: "",
          q: "Cos'è l'oggetto in foto?",
          answers: ["Un hard disk", "Un mouse", "Un software"]
        }
      },
      {
        title: "2",
        question: {
          img_url: "",
          video_url: "",
          q: "Da quanti bit è composto un byte?",
          answers: ["8 bit", "2 bit", "10 bit", "4 bit", "6 bit", "12 bit"]
        }
      },
      {
        title: "3",
        question: {
          img_url: "",
          video_url: "",
          q: "Quale tra le seguenti affermazioni è corretta?",
          answers: [
            "Un software è un applicativo eseguibile dal PC che permette di eseguire determinate operazioni",
            "Un software è un tipo di virus altamente pericoloso che può compromettere il funzionamento di un PC",
            "Un software è un tipo di sottomarino utilizzato prevalentemente per perlustrazioni dei fondali marini"]
        }
      },
      {
        title: "4",
        question: {
          img_url: "https://gzsecutel.it/1449-large_default/chiavetta-usb-wifi-professionale-per-xvr-e-nvr-gizeta.jpg",
          video_url: "",
          q: "Cos'è l'oggetto in foto?",
          answers: ["Una chiavetta USB", "Un mouse bluetooth", "Un software"]
        }
      },
      {
        title: "5",
        question: {
          img_url: "",
          video_url: "",
          q: "Quale componente tra quelli elencati non è indispensabile per il funzionamento di un PC?",
          answers: ["Stampante", "Hard disk", "RAM", "CPU"]
        }
      },
      {
        title: "6",
        question: {
          img_url: "https://www.aranzulla.it/wp-content/contenuti/2017/03/bose20.jpg",
          video_url: "",
          q: "A cosa serve l'oggetto in foto?",
          answers: ["Per sentire l'audio del computer", "Per raffreddare il computer", "Per spegnere il computer"]
        }
      },
      {
        title: "7",
        question: {
          img_url: "",
          video_url: "",
          q: "A cosa servono le ventole nel computer?",
          answers: ["Raffreddare il pc", "Riscaldare il pc", "Ad accendere il pc"]
        }
      },
      {
        title: "8",
        question: {
          img_url: "",
          video_url: "",
          q: "Qual è l'unità di misura della capacità di un Hard Disk?",
          answers: ["GigaByte/TeraByte", "Pollici", "Centimetri quadrati"]
        }
      },
      {
        title: "9",
        question: {
          img_url: "http://4.bp.blogspot.com/_cwEVvc2cBf0/TNPuLees6MI/AAAAAAAAAiY/oA9V195YY8A/s1600/Un+CD+visto+dal+lato+su+cui+avviene+la+lettura+e+scrittura.jpg",
          video_url: "",
          q: "Cos'è l'oggetto in foto?",
          answers: ["Un CD", "Un mouse", "Una tastiera"]
        }
      },
      {
        title: "10",
        question: {
          img_url: "",
          video_url: "",
          q: "Quale dei seguenti software non è un sistema operativo?",
          answers: ["Internet Explorer", "Windows", "Apple MAC OS", "Linux"]
        }
      },
      {
        title: "11",
        question: {
          img_url: "",
          video_url: "",
          q: "Cos'è Google?",
          answers: ["Un motore di ricerca", "Un software", "Un monitor"]
        }
      },
      {
        title: "12",
        question: {
          img_url: "https://www.logitech.com/content/dam/logitech/en/products/mice/m171/gallery/m171-gallery-blue-1.png",
          video_url: "",
          q: "Cos'è l'oggetto in foto?",
          answers: ["Un mouse", "Una stampante", "Una CPU"]
        }
      },
      {
        title: "13",
        question: {
          img_url: "",
          video_url: "https://www.youtube.com/embed/lElXAgd1hGA",
          q: "Di che università si tratta?",
          answers: ["UNICAM", "UNIMC", "UNIVPN"]
        }
      },
      {
        title: "14",
        question: {
          img_url: "https://images.eprice.it/nobrand/0/hres/860/202436860/DAM202436860-11-ac4e5840-604d-41c4-8694-e5b670e2aee1.jpg",
          video_url: "",
          q: "Cos'è l'oggetto in foto?",
          answers: ["Una stampante", "Un dispositivo di archiviazione esterno", "Una tastiera"]
        }
      },
      {
        title: "15",
        question: {
          img_url: "",
          video_url: "",
          q: "Cosa significa P.C.?",
          answers: ["Personal computer", "Professional computer", "Personal counter"]
        }
      }
    ]
  };

  constructor(private alertCreator: AlertCreatorService) {
    this.cells = this.config.cells;
  }

  ngOnInit() {
  }

  /**
  * Controlla se ci sono caselle selezionate tramite le checkbox.
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
 * Elimina le caselle selezionate.
 */
  deleteCells() {
    let toDelete = Object.keys(this.edit);
    const indexesToDelete = toDelete.filter(index => this.edit[index]).map(key => +key);

    while (indexesToDelete.length) {
      this.cells.splice(indexesToDelete.pop(), 1);
    }
  }

  bulkDelete() {
    if (this.bulkEdit) {
      if (this.edit && Object.keys(this.edit).length != 0 && this.edit.constructor === Object && this.checkSelectedCells())
        this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare le caselle selezionate?", () => {
          this.deleteCells();
          this.toggleBulkEdit();
        });
      else this.alertCreator.createInfoAlert('Errore', 'Seleziona prima qualche elemento!');
    }
    else {
      this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare tutte le caselle?", () => {
        this.cells = [];
      });
    }
  }

  /**
   * Abilita il selezionamento multiplo degli elementi per l'eliminazione.
   */
  toggleBulkEdit() {
    this.expandedCell = null;
    this.bulkEdit = !this.bulkEdit;
    this.edit = {};
  }

  expandCell(cell) {
    if (this.expandedCell != cell)
      this.expandedCell = cell;
    else this.expandedCell = null;
  }

  addCell() {
    if (this.cells.length == 0)
      this.cells.push(this.getCellObject(0));
    this.cells.push(this.getCellObject(this.cells.length));
  }

  getCellObject(index) {
    return {
      title: index,
      question: { img_url: "", video_url: "", q: "", answers: [] }
    }
  }

  modificaDomanda(i, j, event) {
    this.cells.forEach(cell => {
      if (cell.title == i) {
        cell.question.answers[j] = event.target.value;
      }
    })
  }
}
