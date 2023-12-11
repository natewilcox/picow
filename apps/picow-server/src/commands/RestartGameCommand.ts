import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { StartGameCommand } from "./StartGameCommand";

type Payload = {
};

export class RestartGameCommand extends Command<PublicRoom, Payload> {

    async execute() {

        console.log("RestartGameCommand executed");

        //reset game state
        this.room.state.winner = "";
        this.room.state.ready = true;
        this.room.state.inProgress = false;
        this.room.state.startingIn = 5;
        this.room.state.gameover = false;

        if(this.room.state.player1) {
            this.room.state.player1.points = 0;
            this.room.state.player1.offerRematch = false;
        }

        if(this.room.state.player2) {
            this.room.state.player2.points = 0;
            this.room.state.player2.offerRematch = false;
        }

        this.room.dispatcher.dispatch(new StartGameCommand());
    }
}