export declare interface GameLogic {
    /**
     * Variabile booleana per indicare se l'utente sta uscendo dalla pagina o no:
     * * **true** se l'utente sta uscendo dalla pagina
     * * **false** altrimenti
     */
    isLeavingPage: boolean;

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

    /**
     * Gestisce un errore causato da una chiamata REST e crea un alert 
     * solo se l'utente non sta abbandonando la pagina. 
     * @param res Response della chiamata REST
     * @param errorText Header dell'alert
     */
    handleError(res, errorText: string);
}