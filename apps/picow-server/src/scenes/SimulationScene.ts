import '@geckos.io/phaser-on-nodejs';
import Phaser from "phaser";
import { PlayerState } from '../rooms/schema/PlayerState';
import { Block } from '../objects/Block';
import { Ball } from '../objects/Ball';
import { Paddle } from '../objects/Paddle';
import { Player } from '../objects/Player';
import { Client } from 'colyseus';
import { Goal } from '../objects/Goal';
import { Item } from '../objects/Item';
import { ItemState } from '../rooms/schema/ItemState';
import { ClientService } from '@natewilcox/colyseus-nathan';
import { ClientMessages, ServerMessages } from '@natewilcox/picow-shared';
import { PublicRoom } from '../rooms/PublicRoom';
import { BallState } from '../rooms/schema/BallState';
import { PaddleState } from '../rooms/schema/PaddleState';
import { BlockState } from '../rooms/schema/BlockState';

export enum SimulationEvents {
    OnJoined = 'onjoined',
    OnLeave = 'onleave',
    OnBallBroken = 'onballbroken',
    OnStart = 'onstart'
}

export const SimulationEventEmitter = new Phaser.Events.EventEmitter();

export class SimulationScene extends Phaser.Scene {

    id_index = 0;

    player1: Player;
    player1Paddle: Paddle;
    ball1: Ball;

    player2: Player;
    player2Paddle: Paddle;
    ball2: Ball;

    blocks: Phaser.Physics.Arcade.StaticGroup;
    balls: Phaser.Physics.Arcade.Group;
    paddles: Phaser.Physics.Arcade.Group;
    items: Phaser.Physics.Arcade.Group;

    room: PublicRoom;
    CLIENT: ClientService<ServerMessages>;

    goal1: Goal;
    goal2: Goal;

    constructor() {
        super("SimulationScene");
    }

    preload() {

        this.blocks = this.physics.add.staticGroup({
            classType: Block
        });

        this.balls = this.physics.add.group({
            classType: Ball
        });

        this.paddles = this.physics.add.group({
            classType: Paddle
        });

        this.items = this.physics.add.group({
            classType: Item
        });
    }

    create(config: { room: PublicRoom, CLIENT: ClientService<ServerMessages> }) {
        console.log("simulation started");
        
        this.room = config.room;
        this.CLIENT = config.CLIENT;
        
        this.initializeBoard();

        //physics settings
        this.physics.add.collider(this.balls, this.blocks, this.handleHitBlock);
        this.physics.add.collider(this.paddles, this.balls, this.handleHitBall);
        this.physics.add.collider(this.balls, this.goal1, this.handleGoal);
        this.physics.add.collider(this.balls, this.goal2, this.handleGoal);
        this.physics.add.collider(this.items, this.paddles, this.handleCollectItem);

        //simulation events
        SimulationEventEmitter.on(SimulationEvents.OnJoined, this.createPlayerObject);
        SimulationEventEmitter.on(SimulationEvents.OnLeave, this.destroyPlayerObject);
        SimulationEventEmitter.on(SimulationEvents.OnStart, this.handleStart);

        //user input
        this.CLIENT.on(ClientMessages.SendInput, this.handleUserInput);

        //scene events
        this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.postUpdate);
    }

    private initializeBoard = () => {

        this.goal1 = new Goal(this, 200, 0);
        this.physics.add.existing(this.goal1);
        this.goal1.setSize(400, 10);
        this.goal1.setPushable(false);

        this.goal2 = new Goal(this, 200, 790);
        this.physics.add.existing(this.goal2);
        this.goal2.setSize(400, 10);
        this.goal2.setPushable(false);
    }

    private handleCollectItem = (obj1: any, obj2: any) => {

        const item = obj1 as Item;
        const paddle = obj2 as Paddle;

        this.removeItem(item);
        paddle.powerUp();
    }

    private handleGoal = (obj1: any, obj2: any) => {

        if(!this.room.state.inProgress) {
            return;
        }

        const goal = obj1 as Goal;
        const ball = obj2 as Ball;

        this.removeBall(ball);

        //breakable balls cant score goals
        if(ball.breakable) {
            return;
        }

        //temp crappy logic to end game when ball is lost
        if(this.room.state.player1?.id == goal.owner?.id) {
            console.log("Player 1 won");
            this.setWinner(this.room.state.player1);
        }
        else {
            console.log("Player 2 won");
            this.setWinner(this.room.state.player2);
        }
    }

    private handleHitBall = (obj1: any, obj2: any) => {

        const paddle = obj1 as Paddle;
        const ball = obj2 as Ball;

        //switch owner to whoever hits the ball
        ball.owner = paddle === this.player1Paddle ? this.room.state.player1 : this.room.state.player2;
    } 

    private handleHitBlock = (obj1: any, obj2: any) => {

        if(!this.room.state.inProgress) {
            return;
        }

        const ball = obj1 as Ball;
        const block = obj2 as Block;

        ball.owner.points++;

        if(block.hasItem) {
            console.log(`${ball.owner.id} broke a special block. pts=${ball.owner.points}`);
            console.log('dropping item');

            //create an item and send it towards the person that owns the ball
            const item = this.createItem(block.x, block.y) as Item;
            item.setVelocity(0, ball.owner.id == this.room.state.player1.id ? 100 : -100);

            //remove in 10 seconds if not collected
            setTimeout(() => {
                if(item.active) {
                    console.log('item despawn')
                    this.removeItem(item);
                }
            }, 10000)
        }
        else {
            console.log(`${ball.owner.id} broke a regular block. pts=${ball.owner.points}`);
        }

        this.removeBlock(block);

        if(ball.breakable) {
            this.removeBall(ball);
        }

        this.checkWinner();
    }

    private handleUserInput = (client: Client, data: any) => {
        
        const paddle = client.id == this.room.state.player1?.id ? this.player1Paddle : this.player2Paddle;

        if(paddle) {
            paddle.setPosition(data.pos, paddle.y);
        }
    };

    private handleStart = () => {
        console.log('handleStart')

        this.clearBlocks();
        this.addBlocks();

        //create a ball for each player
        if(this.room.state.player1) {
            const ball = this.createBall(100, 600);
            ball.owner = this.room.state.player1;
            ball.bounce();
        }

        if(this.room.state.player2) {
            const ball = this.createBall(100, 200);
            ball.owner = this.room.state.player2;
            ball.bounce();
        }
    }

    private addBlocks = () => {


        for(let y=300;y<500;y+=20) {
            for(let x=20;x<this.game.canvas.width;x+=40) {
                this.createBlock(x, y);
            }
        }
    }

    private clearBlocks = () => {

        while(this.blocks.getFirstAlive()) {
            let block = this.blocks.getFirstAlive() as Block;
            this.removeBlock(block);
        }
    }

    private clearBalls = () => {
        while(this.balls.getFirstAlive()) {
            let ball = this.balls.getFirstAlive() as Ball;
            this.removeBall(ball);
        }
    }

    private clearItems = () => {
        while(this.items.getFirstAlive()) {
            let item = this.items.getFirstAlive() as Item;
            this.removeItem(item);
        }
    }

    createBall = (x: number, y: number) => {

        const ball: Ball = this.balls.get(x, y);

        const state = new BallState(x, y);
        state.id = this.id_index++;

        ball.setCollideWorldBounds(true);
        ball.setBounce(1);
        ball.setSize(state.r, state.r);

        ball.serverState = state;
        this.room.state.balls.push(state);

        return ball;
    }

    private createPaddle = (x: number, y: number) => {

        const paddle: Paddle = this.paddles.get(x, y);
        const state = new PaddleState(x, y);
        state.id = this.id_index++;

        paddle.setCollideWorldBounds(true);
        paddle.setSize(state.w, state.h);
        paddle.setPushable(false);
        paddle.serverState = state;
        this.room.state.paddles.push(state);

        return paddle;
    }

    private createBlock = (x: number, y: number) => {

        const randomNumber = Math.floor(Math.random() * 100) + 1
        const block = this.blocks.get(x, y);
        const state = new BlockState(x, y);
        state.id = this.id_index++;

        block.hasItem = randomNumber > 80 ? 1 : 0;
        block.setSize(state.w, state.h);
        block.serverState = state;

        this.room.state.blocks.push(state);

        return block;
    }

    private createItem = (x: number, y: number) => {

        console.log('create item')
        const item = this.items.get(x, y);
        const state = new ItemState(x, y);
        state.id = this.id_index++;

        item.setSize(state.w, state.h);
        item.serverState = state;
   
        this.room.state.items.push(state);
        return item;
    }

    private removeBall(ball: Ball) {

        const index = this.room.state.balls.findIndex(b => b.id == ball.serverState.id);
        this.room.state.balls.splice(index, 1);
 
        //remove ball sprite
        this.balls.killAndHide(ball);
        ball.destroy();
    }

    private removeBlock(block: Block) {

        //remove block from state
        const index = this.room.state.blocks.findIndex(b => b.id == block.serverState.id);
        this.room.state.blocks.splice(index, 1);

        this.blocks.killAndHide(block);
        block?.destroy();
    }

    private removeItem(item: Item) {

        //remove item from state
        const index = this.room.state.items.findIndex(i => i.id == item.serverState.id);
        this.room.state.items.splice(index, 1);

        this.items.killAndHide(item);
        item?.destroy();
    }

    private checkWinner() {
        
        //if there are no active blocks, set winner to whoever has most points
        if(this.blocks.getChildren().length == 0) {

            console.log("no more blocks to hit");
            this.setWinner(this.room.state.player1.points > this.room.state.player2.points ? this.room.state.player1 : this.room.state.player2);
            
            this.room.state.gameover = true;
            this.room.state.inProgress = false;
        }
    }

    private setWinner = (player: PlayerState) => {

        this.room.state.winner = player?.id;
        this.room.state.gameover = true;
        this.room.state.inProgress = false;

        this.clearBalls();
        this.clearItems();
    }

    private createPlayerObject = (playerState: PlayerState) => {

        console.log("player joined, creating player paddle and goal");
        const client = this.room.clients.find(c => c.id == playerState.client.id);
        const isPlayer1 = this.room.state.player1.id === client.id;
        const paddleY = isPlayer1 ? 700 : 100;

        if(isPlayer1) {
            this.player1Paddle = this.createPaddle(200, paddleY);
            this.player1Paddle.owner = playerState;
            this.goal1.owner = playerState;

        }
        else {
            this.player2Paddle = this.createPaddle(200, paddleY);
            this.player2Paddle.owner = playerState;
            this.goal2.owner = playerState;
        }
    }

    private destroyPlayerObject = (playerState: PlayerState) => {
  
        const client = this.room.clients.find(c => c.id == playerState.client.id);
        console.log("player left, detroy object");
    }

    update(time: number, delta: number): void {
        
        this.balls.getChildren().forEach((ball) => {
      
            const b = ball as Ball;
            b.stateMachine.update(delta);
        });

        this.blocks.getChildren().forEach((block) => {
      
            const b = block as Block;
            b.stateMachine.update(delta);
        });

        this.paddles.getChildren().forEach((paddle) => {
      
            const p = paddle as Paddle;
            p.stateMachine.update(delta);
        });

        this.items.getChildren().forEach((paddle) => {
      
            const p = paddle as Paddle;
            p.stateMachine.update(delta);
        });
    }

    private postUpdate = () => {

        this.balls.getChildren().forEach((ball) => {
            
            const b = ball as Ball;
            b.serverState.x = b.x
            b.serverState.y = b.y;
        });

        this.blocks.getChildren().forEach((block) => {
            
            const b = block as Block;
            b.serverState.x = b.x
            b.serverState.y = b.y;
        });

        this.paddles.getChildren().forEach((paddle) => {
            
            const p = paddle as Paddle;
            p.serverState.x = p.x
            p.serverState.y = p.y;
        });

        this.items.getChildren().forEach((item) => {
            
            const i = item as Item;
            i.serverState.x = i.x
            i.serverState.y = i.y;
        });
    }
}