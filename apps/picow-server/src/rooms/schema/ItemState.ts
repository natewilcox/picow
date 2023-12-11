import { Schema, type } from "@colyseus/schema";
import { IItemState } from "@natewilcox/picow-shared";

export class ItemState extends Schema implements IItemState {

    @type("number")
    id = 0;
    
    @type("number")
    x = 0;
    
    @type("number")
    y = 0;

    @type("number")
    w = 5;

    @type("number")
    h = 5;

    @type("number")
    type = 0;

    constructor(x: number, y: number) {
        super();
        
        this.x = x;
        this.y = y;
    }
}
