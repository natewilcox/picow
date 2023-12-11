import 'dotenv/config'
import { ItemState } from "@natewilcox/picow-server/dist/rooms/schema/ItemState";
import { Scene, ServerService } from "@natewilcox/phaser-nathan";
import { ClientMessages, IBallState, IBlockState, IPaddleState, IRoomState, ServerMessages } from '@natewilcox/picow-shared';

export enum PicowEvents {
    OnStatusChanged = 'OnStatusChanged',
    OnRematch = 'OnRematch'
}

export const PicowEventEmitter = new Phaser.Events.EventEmitter();

export class GameScene extends Scene
{
    SERVER: ServerService<IRoomState, ClientMessages>;
    SPRITE_MAP = new Map<number, Phaser.GameObjects.GameObject>();

    private curPos = -1;
    private prevPos = -1;

    private isPlayerOne = false;
    private isPlayerTwo = false;

    constructor () {
        super('game');
    }

    preload() {
        this.load.image("square", "images/square.png");
    }

    async create(config: any) {
        
        const url = `${process.env.HOST}`;
        console.log(`Connecting to: ${url}`);
        
        this.SERVER = new ServerService(url);
        console.log("playing game");

        //get room info. private if invited. public if not
        let online = config.online;
        let roomName = !config.invite ? 'picow_public_room' : 'picow_private_room';
        let roomId = config.inviteCode;

        try {
            console.log(`joining ${roomName}`);
            await this.SERVER.connect(roomName, { roomId, online });

            //add game objects
            this.SERVER.state.blocks.forEach(this.handleBlockAdd);
            this.SERVER.state.blocks.onAdd(this.handleBlockAdd);

            this.SERVER.state.balls.forEach(this.handleBallAdd);
            this.SERVER.state.balls.onAdd(this.handleBallAdd);
            this.SERVER.state.balls.onRemove(this.handleBallRemove);

            this.SERVER.state.items.forEach(this.handleItemAdd);
            this.SERVER.state.items.onAdd(this.handleItemAdd);
            this.SERVER.state.items.onRemove(this.handleItemRemove);

            this.SERVER.state.paddles.forEach(this.handlePaddleAdd);
            this.SERVER.state.paddles.onAdd(this.handlePaddleAdd);

            //handle server state change
            this.SERVER.onRoomStateChange(this.handleRoomStateChange);

            //server events
            this.SERVER.on(ServerMessages.StartGame, this.handleStartGame);

            //track user input
            this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
                this.curPos = this.isPlayerTwo ? this.game.canvas.width - pointer.x : pointer.x;
            });

            //send input every 50ms
            setTimeout(this.sendInputToServer, 50);

            if(config.invite) {

                //send invite
                const inviteUrl = `https://picow.natewilcox.io?invite=${this.SERVER.RoomId}`;
                var smsUri = 'sms:?body=' + encodeURIComponent(`I challenge you at ${inviteUrl}`);
    
                // Open the messaging app with the default message
                window.open(smsUri, '_blank');
            }

            //start hud scene
            this.scene.launch('HUD', {
                SERVER: this.SERVER
            });

            PicowEventEmitter.on(PicowEvents.OnRematch, this.handleRematch)
        }
        catch(e) {
            console.error(`unable to join ${roomName}. Returning to lobby`, e);
            this.handleBack();
        }
    }

    private handleStartGame = () => {
        console.log('start game')
    }

    private handleRoomStateChange = () => {
         
        this.isPlayerOne = this.SERVER.SessionID == this.SERVER.state.player1?.id;
        this.isPlayerTwo = !this.isPlayerOne;

        if(this.isPlayerTwo) {
            //turn the camera around for player 2
            this.cameras.main.setAngle(180);
            console.log("camera rotated 180 degrees")
        }

        PicowEventEmitter.emit(PicowEvents.OnStatusChanged, this.SERVER.state);
    }

    private sendInputToServer = () => {

        if(this.curPos != this.prevPos) {
            this.SERVER.send(ClientMessages.SendInput, { pos: this.curPos });
        }
        
        this.prevPos = this.curPos;
        setTimeout(this.sendInputToServer, 50);
    };

    private handleBlockAdd = (block: IBlockState) => {
 
        const b = this.add.image(block.x, block.y, 'square');
        b.setScale((block.w)/10, (block.h)/10);

        block.onChange(() => {
            b.setPosition(block.x, block.y);
        });

        block.onRemove(() => {
            b.destroy();
        })
    }

    private handlePaddleAdd = (paddle: IPaddleState) => {
        
        const p = this.add.image(paddle.x, paddle.y, 'square');
        p.setScale((paddle.w)/10, (paddle.h)/10);

        paddle.onChange(this.updateObjectPosition(p, paddle));
    }

    private handleBallAdd = (ball: IBallState) => {

        const b = this.add.image(ball.x, ball.y, 'square');
        this.SPRITE_MAP.set(ball.id, b);

        b.setScale((ball.r*2)/10, (ball.r*2)/10);
        ball.onChange(this.updateObjectPosition(b, ball));
    }

    private handleItemAdd = (item: ItemState) => {
        console.log('adding item')
        const i = this.add.image(item.x, item.y, 'square');
        this.SPRITE_MAP.set(item.id, i);

        i.setScale((item.w)/10, (item.h)/10);
        item.onChange(this.updateObjectPosition(i, item));
    }

    private updateObjectPosition(sprite: Phaser.GameObjects.GameObject, obj: any) {

        let lastX = 0;
        let lastY = 0;
        let lastUpdate = new Date();
        let movementTween: Phaser.Tweens.Tween = null;

        return () => {

            const newX = obj.x;
            const newY = obj.y;
            const now = new Date();
            const timeout = now.getTime() - lastUpdate.getTime();
            lastUpdate = now;

            if(movementTween) {
                movementTween.stop();
            }

            //tween to new position
            movementTween = this.tweens.add({
                targets: sprite,
                x: newX,
                y: newY,
                duration: timeout,
                ease: 'linear'
            });
    
            //lastX = sprite.body.gameObject.x;
            //lastY = sprite.body.gameObject.y;
        }
    }

    private handleBallRemove = (ball: IBallState) => {
        
        const b = this.SPRITE_MAP.get(ball.id);
    
        if(b) {
            b.destroy();
            this.SPRITE_MAP.delete(ball.id);
        }
    }

    private handleItemRemove = (item: ItemState) => {
        
        const i = this.SPRITE_MAP.get(item.id);
    
        if(i) {
            i.destroy();
            this.SPRITE_MAP.delete(item.id);
        }
    }

    private handleRematch = () => {
        this.SERVER.send(ClientMessages.Rematch);
    };

    private handleBack = () => {
        console.log("going back to lobby");
        
        this.SERVER.leave();

        this.scene.stop('game');
        this.scene.start('lobby');
    };
}