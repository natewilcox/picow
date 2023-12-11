import { Room, Client } from "@colyseus/core";
import { RoomState } from "./schema/RoomState";
import { JoinCommand } from "../commands/JoinCommand";
import { Dispatcher } from "@colyseus/command";
import { LeaveCommand } from "../commands/LeaveCommand";
import { RematchCommand } from "../commands/RematchCommand";
import { SimulationScene } from "../scenes/SimulationScene";
import { ClientService } from "@natewilcox/colyseus-nathan";
import { ClientMessages } from "@natewilcox/picow-shared";

export class PrivateRoom extends Room<RoomState> {
  
    CLIENT: ClientService<ClientMessages>;
    game: Phaser.Game;
    maxClients = 2;
    dispatcher: Dispatcher<PrivateRoom> = new Dispatcher(this);

    onCreate (options: any) {

        const PATCH = 30;
        const FPS = 30;
        
        console.log("public room", this.roomId, " is created...");
        this.setPatchRate(1000/PATCH);
        this.setState(new RoomState());
        this.setPrivate(true);
        this.state.isCPU = !options.online;
        
        this.CLIENT = new ClientService(this);
        this.CLIENT.on(ClientMessages.Rematch, (client) => {
            this.dispatcher.dispatch(new RematchCommand(), {
                client
            });
        });

        const config = {
            type: Phaser.HEADLESS,
            width: 400,
            height: 800,
            fps: {
                target: FPS,
                forceSetTimeOut: true
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0, x: 0 }
                }
            }
        }

        console.log("Starting simluation scene");

        this.game = new Phaser.Game(config);
        this.game.scene.add('SimulationScene', SimulationScene, true, { room: this, CLIENT: this.CLIENT });  
    }

    onJoin (client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        this.dispatcher.dispatch(new JoinCommand(), {
            client
        });
    }

    async onLeave (client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");

        try {

            console.log("allowing reconnect to " + client._reconnectionToken);
            const reconnection = await this.allowReconnection(client, 60);
            console.log("reconnected");
        }
        catch(e) {
        
            console.log("timeout waiting for reconnect");
            this.dispatcher.dispatch(new LeaveCommand(), {
                client
            });
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
