import { Question } from "src/app/modal-pages/question-modal/question";

export class GooseGameCell {
    title: string;
    question: Question;

    constructor(title: string, question?: Question) {
        this.title = title;
        this.question = question || null;
    }
}