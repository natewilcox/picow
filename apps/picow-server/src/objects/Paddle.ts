import { PaddleState } from "../rooms/schema/PaddleState";
import { SimulationScene } from "../scenes/SimulationScene";
import { PlayerState } from "../rooms/schema/PlayerState";
import { StateMachine } from "@natewilcox/nathan-core";

export class Paddle extends Phaser.Physics.Arcade.Sprite {

    x: number;
    y: number;
    owner: PlayerState;
    serverState: PaddleState;
    stateMachine: StateMachine = new StateMachine(this, 'fsm');
    
    constructor(scene: SimulationScene, x: number, y: number, state: PaddleState) {
        super(scene, x, y, '')

        this.x = x;
        this.y = y;
        this.serverState = state;

        this.stateMachine
            .addState("normal", {
                onEnter: this.onNormalEnter
            })
            .addState("powered", {
                onEnter: this.onPoweredEnter
            });
    }

    powerUp() {
        if(!this.stateMachine.isCurrentState("powered")) {
            this.stateMachine.setState("powered");
        }
    }

    private onNormalEnter = () => {
        console.log("normal mode");
    }

    private onPoweredEnter = () => {
        console.log("powered mode");

        let count = 5;

        //shoot a ball every second
        const shoot = () => {

            const scene = this.scene as SimulationScene;
            const ball = scene.createBall(this.x, this.y);

            ball.setVelocity(0, this.owner.id == scene.room.state.player1.id ? -700 : 700);
            ball.owner = this.owner;
            ball.breakable = true;

            if(count-- > 0) {
                setTimeout(shoot, 200);
            }
            else {
                this.stateMachine.setState("normal");
            }
        };

        shoot();
    }
}