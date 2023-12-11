import { Schema, type } from "@colyseus/schema";
import { IPaddleState } from "@natewilcox/picow-shared";

export class PaddleState extends Schema implements IPaddleState {

    @type("number")
    id = 0;

    @type("number")
    x = 0;
    
    @type("number")
    y = 0;

    @type("number")
    w = 100;

    @type("number")
    h = 10;

    constructor(x: number, y: number) {
        super();
        
        this.x = x;
        this.y = y;
    }
}
