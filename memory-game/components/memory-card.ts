import { MemoryCardComponent } from "./memory-card/memory-card.component";

export class MemoryCard {
    title: String;
    text: String;
    url: String;
    question;
    answers = [];
    enabled = true;
    memory_card = MemoryCardComponent.prototype;

    constructor(title: String, text: String, url: String, question: String, answers) {
        this.title = title;
        this.text = text;
        this.url = url;
        this.question = question;
        this.answers = answers;
    }
}