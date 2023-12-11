import { Schema, type, ArraySchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";
import { BallState } from "./BallState";
import { PaddleState } from "./PaddleState";
import { BlockState } from "./BlockState";
import { ItemState } from "./ItemState";
import { IRoomState } from "@natewilcox/picow-shared";

export class RoomState extends Schema implements IRoomState {

    isCPU = false;

    @type("boolean")
    isStarting = false;

    @type("boolean")
    inProgress = false;

    @type("boolean")
    gameover = false;

    @type("number")
    startingIn = 5;

    @type("string")
    currentTurn = "";

    @type("string")
    winner = "";
    
    @type("boolean")
    ready = false;

    @type(PlayerState)
    player1: PlayerState;

    @type(PlayerState)
    player2: PlayerState;

    @type([BallState])
    balls = new ArraySchema<BallState>();

    @type([PaddleState])
    paddles = new ArraySchema<PaddleState>();

    @type([BlockState])
    blocks = new ArraySchema<BlockState>();

    @type([ItemState])
    items = new ArraySchema<ItemState>();
}
