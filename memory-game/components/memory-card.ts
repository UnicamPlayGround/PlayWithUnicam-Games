export class MemoryCard {
    title: String;
    text: String;
    url: String;
    enabled = true;

    constructor(title: String, text: String, url: String) {
        this.title = title;
        this.text = text;
        this.url = url;
    }
}