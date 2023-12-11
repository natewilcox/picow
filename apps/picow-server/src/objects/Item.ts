import { StateMachine } from "@natewilcox/nathan-core";
import { ItemState } from "../rooms/schema/ItemState";

export class Item extends Phaser.Physics.Arcade.Sprite {

    x: number;
    y: number;
    serverState: ItemState;
    stateMachine: StateMachine = new StateMachine(this, 'fsm');
    
    constructor(scene: Phaser.Scene, x: number, y: number, state: ItemState) {
        super(scene, x, y, '')

        this.x = x;
        this.y = y;
        this.serverState = state;
    }
}