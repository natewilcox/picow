import { Schema } from "@colyseus/schema";

export interface IItemState extends Schema {

    id: number;
    x: number;
    y: number;
    w: number;
    h: number;
    type: number;
}
