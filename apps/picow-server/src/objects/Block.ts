import { StateMachine } from "@natewilcox/nathan-core";
import { BlockState } from "../rooms/schema/BlockState";

export class Block extends Phaser.Physics.Arcade.Sprite {

    x: number;
    y: number;
    hasItem: boolean;
    serverState: BlockState;
    stateMachine: StateMachine = new StateMachine(this, 'fsm');
    
    constructor(scene: Phaser.Scene, x: number, y: number, state: BlockState) {
        super(scene, x, y, '')

        this.x = x;
        this.y = y;
        this.serverState = state;
    }
}