import { Schema } from "@colyseus/schema";

export interface IBallState extends Schema {

    id: number;
    x: number;
    y: number;
    r: number;
}
