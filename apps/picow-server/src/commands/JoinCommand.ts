import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { faker } from '@faker-js/faker';
import { PlayerState } from "../rooms/schema/PlayerState";
import { SimulationEventEmitter, SimulationEvents } from "../scenes/SimulationScene";
import { StartGameCommand } from "./StartGameCommand";

type Payload = {
    client: any
};

export class JoinCommand extends Command<PublicRoom, Payload> {

    async execute({ client }: Payload) {
        console.log("JoinCommand executed");
        
        const player = new PlayerState();
        player.id = client.id;
        player.client = client;
        player.name = faker.internet.userName();

        if(!this.room.state.player1) {

            console.log('player assigned to player 1');
            this.room.state.player1 = player;
        }
        else {

            console.log('player assigned to player 2');
            this.room.state.player2 = player;
        }

        //TODO remove
        //this.room.dispatcher.dispatch(new StartGameCommand());

        //if max players have joined, start game
        if(this.room.state.player1 && this.room.state.player2) {
            this.room.dispatcher.dispatch(new StartGameCommand());
        }

        SimulationEventEmitter.emit(SimulationEvents.OnJoined, player);
    }
}