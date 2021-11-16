import { MemoryCard } from "./memory-card";

export class MemoryPlayer {
    nickname: String;
    guessedCards: MemoryCard[] = [];

    constructor(nickname: String) {
        this.nickname = nickname;
    }
}