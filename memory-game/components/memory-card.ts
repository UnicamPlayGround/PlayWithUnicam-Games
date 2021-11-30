import { MemoryCardComponent } from "./memory-card/memory-card.component";

export class MemoryCard {
    title: String;
    text: String;
    url: String;
    enabled = true;
    memory_card = MemoryCardComponent.prototype;

    constructor(title: String, text: String, url: String) {
        this.title = title;
        this.text = text;
        this.url = url;
    }
}