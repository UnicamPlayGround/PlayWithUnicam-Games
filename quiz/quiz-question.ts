export class QuizQuestion{
    question: String;
    answers: String[];
    imgUrl: String;
    videoUrl: String;
    countdownSeconds: number;
    score: number;

    constructor(question: String, answers: String[], imgUrl: String, videoUrl: String, countdownSeconds: number, score: number) {
        this.question = question;
        this.answers = answers;
        this.imgUrl = imgUrl;
        this.videoUrl = videoUrl;
        this.countdownSeconds = countdownSeconds;
        this.score = score;
    }

    getJSON() {
        var json: any = {};
        json.question = this.question;
        json.answers = this.answers;
        json.img_url = this.imgUrl;
        json.video_url = this.videoUrl;
        json.countdown_seconds = this.countdownSeconds;
        json.score = this.score;
        return json;
    }
}