import { Schema } from "@colyseus/schema";

export interface IPlayerState extends Schema {

    isCPU: boolean;
    client: any;
    points: number;
    id: string;
    name: string;
    offerRematch: boolean;
}
