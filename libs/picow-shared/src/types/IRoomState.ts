import { Schema, ArraySchema } from "@colyseus/schema";
import { IPlayerState } from "./IPlayerState";
import { IBallState } from "./IBallState";
import { IPaddleState } from "./IPaddleState";
import { IBlockState } from "./IBlockState";
import { IItemState } from "./IItemState";

export interface IRoomState extends Schema {

    isCPU: boolean;
    isStarting: boolean;
    inProgress: boolean;
    gameover: boolean;
    startingIn: number;
    currentTurn: string;
    winner: string;
    ready: boolean;
    player1: IPlayerState;
    player2: IPlayerState;
    balls: ArraySchema<IBallState>;
    paddles: ArraySchema<IPaddleState>;
    blocks: ArraySchema<IBlockState>;
    items: ArraySchema<IItemState>;
}
