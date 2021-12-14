import { Game } from "./game";

export declare interface TurnBasedGame extends Game {

    concludiTurno(): Promise<void>;
}