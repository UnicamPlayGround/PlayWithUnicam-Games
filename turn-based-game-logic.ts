import { GameLogic } from "./game-logic";

export declare interface TurnBasedGameLogic extends GameLogic {

    concludiTurno(): Promise<void>;
}