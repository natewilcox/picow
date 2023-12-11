import { Schema, type } from "@colyseus/schema";
import { IPlayerState } from "@natewilcox/picow-shared";
import { Client } from "colyseus";

export class PlayerState extends Schema implements IPlayerState {

    isCPU = false;
    client: Client;
    points = 0;
    
    @type("string")
    id = "";

    @type("string")
    name = "";
    
    @type("boolean")
    offerRematch = false;
}
