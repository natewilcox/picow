
import 'dotenv/config'
import { PicowEventEmitter, PicowEvents } from './GameScene';
import { Scene, ServerService } from '@natewilcox/phaser-nathan';
import { ClientMessages, IRoomState } from '@natewilcox/picow-shared';

export class HUD extends Scene
{
    SERVER: ServerService<IRoomState, ClientMessages>;
    
    private banner: Phaser.GameObjects.Rectangle;
    private status: Phaser.GameObjects.Text

    private rematch: Phaser.GameObjects.Text;
    private rematchBadge: Phaser.GameObjects.Image;

    constructor () {
        super('HUD');
    }

    create (config: any) {

        this.SERVER = config.SERVER;
        this.addHudElements();

        PicowEventEmitter.on(PicowEvents.OnStatusChanged, this.handleStatusChange);
    }

    private handleStatusChange = (state: IRoomState) => {

        this.rematch.setVisible(state.gameover);
        this.rematchBadge.setVisible(state.player1?.offerRematch || state.player2?.offerRematch);

        if(state.isStarting) {

            this.setStatus(state.startingIn > 0 ?`Starting in ${state.startingIn}...` : 'GO!!!');
        }
        else if(state.winner) {
            this.setStatus(state.winner == this.SERVER.SessionID ? "YOU WON!!!" : "YOU LOST...");
        }
        else if (state.inProgress) {
            this.setStatus("");
        }
    }

    private addHudElements = () => {

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.banner = this.add.rectangle(50, 350, 300, 100, 0);
        this.banner.setOrigin(0, 0)
        this.status = this.addText(centerX, 400, "Waiting for Players", '30px', '#FFFFFF');

        this.rematch = this.addText(300, 780, 'REMATCH?', '20px', '#FFFFFF', this.handleRematch);
        this.rematch.setVisible(false);

        this.rematchBadge = this.addImage(377, 777, 'rematch')
        this.rematchBadge.setVisible(false);
    }

    private setStatus = (status: string) => {

        this.banner.setVisible(status != "");
        this.status.setVisible(status != "");
        this.status.setText(status);
    }

    private handleRematch = () => {
        PicowEventEmitter.emit(PicowEvents.OnRematch);
    };

    addImage(x: number, y: number, frame: string, cb?: () => void) {

        const img = this.add.image(x, y, frame);
        img.setScale(0.5, 0.5);
        img.setOrigin(0.5);

        if(cb) {
            img.setInteractive();
            img.on('pointerdown', cb);
        }

        return img;
    }

    addText(x: number, y: number, txt: string, size: string, color: string, cb?: () => void) {

        const gameText = this.add.text(x, y, txt, {
            fontSize: size,
            fontFamily: 'Arial',
            color: color,
            align: 'center'
        });

        gameText.setOrigin(0.5);

        if(cb) {
            gameText.setInteractive();
            gameText.on('pointerdown', cb);
        }

        return gameText;
    }
}