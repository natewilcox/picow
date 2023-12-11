import { Schema } from "@colyseus/schema";

export interface IPaddleState extends Schema {

    id: number;
    x: number;
    y: number;
    w: number;
    h: number;
}
