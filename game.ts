export declare interface Game {
    //TODO commentare

    getGameConfig(): Promise<void>;

    getInfoPartita(): Promise<void>;

    sendMatchData(info: JSON): Promise<void>;

    terminaPartita(): Promise<void>;

    loadInfoLobby(): Promise<void>;

    loadPlayers(): Promise<void>;

    /**
     * Effettua l'operazione di ping.
     */
    ping(): Promise<void>;

    leaveMatch(): Promise<void>;
}