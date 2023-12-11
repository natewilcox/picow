import { Schema, type } from "@colyseus/schema";
import { IBlockState } from "@natewilcox/picow-shared";

export class BlockState extends Schema implements IBlockState {

    @type("number")
    id = 0;
    
    @type("number")
    x = 0;
    
    @type("number")
    y = 0;

    @type("number")
    w = 40;

    @type("number")
    h = 20;

    @type("number")
    type = 0;

    constructor(x: number, y: number) {
        super();
        
        this.x = x;
        this.y = y;
    }
}
