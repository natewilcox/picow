import { Command } from "@colyseus/command";
import { PublicRoom } from "../rooms/PublicRoom";
import { SimulationEventEmitter, SimulationEvents } from "../scenes/SimulationScene";
import { ServerMessages } from "@natewilcox/picow-shared";

type Payload = {
   
};

export class StartGameCommand extends Command<PublicRoom, Payload> {

    async execute() {
        console.log("JoinCommand executed");
        
        this.room.lock();
        this.countDownAndStart();
    }

    private countDownAndStart() {

        this.room.state.isStarting = true;
        this.clock.setTimeout(() => {

            if(this.room.state.startingIn > 0) {

                this.room.state.startingIn--;
                this.countDownAndStart();
            }
            else {
                this.room.state.inProgress = true;
                this.room.state.isStarting = false;

                this.room.CLIENT.send(ServerMessages.StartGame);
                SimulationEventEmitter.emit(SimulationEvents.OnStart);
            }
        }, 1000);
    }
}