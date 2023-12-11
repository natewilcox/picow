import { PlayerState } from "../rooms/schema/PlayerState";

export class Player {

    serverState: PlayerState;

    constructor(state: PlayerState) {

        this.serverState = state;
    }
}