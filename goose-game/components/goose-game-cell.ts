import { Question } from "src/app/modal-pages/question-modal/question";

export class GooseGameCell {
    title: String;
    question: Question;

    constructor(title: String, question: Question) {
        this.title = title;
        this.question = question;
    }
}