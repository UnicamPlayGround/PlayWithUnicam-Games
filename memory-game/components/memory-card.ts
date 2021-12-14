import { Question } from "src/app/modal-pages/question-modal/question";
import { MemoryCardComponent } from "./memory-card/memory-card.component";

export class MemoryCard {
    title: String;
    text: String;
    url: String;
    question: Question;
    enabled = true;
    memory_card = MemoryCardComponent.prototype;

    constructor(title: String, text: String, url: String, question: Question) {
        this.title = title;
        this.text = text;
        this.url = url;
        this.question = question;
    }
}