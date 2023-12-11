import { SimulationScene } from "../scenes/SimulationScene";
import { PlayerState } from "../rooms/schema/PlayerState";

export class Goal extends Phaser.Physics.Arcade.Sprite {

    x: number;
    y: number;
    owner: PlayerState;
    scene: SimulationScene;

    constructor(scene: SimulationScene, x: number, y: number) {
        super(scene, x, y, '')

        this.x = x;
        this.y = y;
        this.scene = scene;
    }
}