import { Schema, type } from "@colyseus/schema";
import { IBallState } from "@natewilcox/picow-shared";

export class BallState extends Schema implements IBallState {

    @type("number")
    id = 0;
    
    @type("number")
    x = 0;
    
    @type("number")
    y = 0;

    @type("number")
    r = 5;

    constructor(x: number, y: number) {
        super();

        this.x = x;
        this.y = y;
    }
}
