import { BallState } from "../rooms/schema/BallState";
import { SimulationScene } from "../scenes/SimulationScene";
import { PlayerState } from "../rooms/schema/PlayerState";
import { StateMachine } from "@natewilcox/nathan-core";

export class Ball extends Phaser.Physics.Arcade.Sprite {

    x: number;
    y: number;
    owner: PlayerState;
    breakable: boolean;
    serverState: BallState;
    stateMachine: StateMachine = new StateMachine(this, 'fsm');
    scene: SimulationScene;

    constructor(scene: SimulationScene, x: number, y: number, state: BallState) {
        super(scene, x, y, '')

        this.x = x;
        this.y = y;
        this.serverState = state;
        this.scene = scene;
        this.breakable = false;
        
        this.stateMachine
            .addState("free", {
                onEnter: this.onFreeEnter
            });
    }

    bounce() {

        this.stateMachine.setState('free');
    }

    private onFreeEnter = () => {
        //determine which direction to go based on owner
        this.setVelocity(100, this.owner.id == this.scene.room.state.player1.id ? -200 : 200);
    }
}