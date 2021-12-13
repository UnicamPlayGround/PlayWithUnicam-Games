export declare interface Game {
    //TODO commentare

    getGameConfig(): Promise<void>;

    getInfoPartita(): Promise<void>;

    inviaDatiPartita(info: JSON): Promise<void>;

    concludiTurno(): Promise<void>;

    terminaPartita(): Promise<void>;

    loadInfoLobby(): Promise<void>;

    loadPlayers(): Promise<void>;

    ping(): Promise<void>;

    abbandonaPartita(): Promise<void>;
}