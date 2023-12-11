import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { RestartGameCommand } from "./RestartGameCommand";

type Payload = {
    client: any
};

export class RematchCommand extends Command<PublicRoom, Payload> {

    async execute({ client }: Payload) {
        console.log("RematchCommand executed");

        //determine who offered a rematch
        if(client.id == this.room.state.player1?.id) {
            this.room.state.player1.offerRematch = true;
        }   

        if(client.id == this.room.state.player2?.id) {
            this.room.state.player2.offerRematch = true;
        }

        //if both agree to rematch, or playing a cpu, restart game
        if(this.room.state.player1?.offerRematch && this.room.state.player2?.offerRematch) {
            this.room.dispatcher.dispatch(new RestartGameCommand());
        }
    }
}