import { Scene } from "@natewilcox/phaser-nathan";

export class LobbyScene extends Scene
{
    titleText: Phaser.GameObjects.Text;
    instructionsText: Phaser.GameObjects.Text;
    playerText: Phaser.GameObjects.Text;
    cpuText: Phaser.GameObjects.Text;
    inviteText: Phaser.GameObjects.Text;
    fullscreen: Phaser.GameObjects.Image;  

    constructor () {
        super('lobby');
    }

    async preload() {
        this.load.image("rematch", "images/rematch.png");
        this.load.image("full-screen", "images/full-screen.png");
    }

    create(options: any) {

        //check if an invite code is in url
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('invite');

        if(inviteCode) {
            
            //remove from search params and remove from history
            urlParams.delete('invite');
            const newURL = window.location.pathname + '?' + urlParams.toString();
            window.history.replaceState({}, document.title, newURL);

            this.redeedInvite(inviteCode);
        }

        this.onScreenResized(() => {
            this.printWelcomeScreen(options)
        });

        this.printWelcomeScreen(options);
    }

    private playOnline = () => {
        console.log("playing online");

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: true
        });
    }

    private playCpu = () => {
        console.log("playing cpu");

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: false
        });
    }

    private invitePlayer = () => {
        console.log("invite player");

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: true,
            invite: true
        });
    }

    private redeedInvite = (inviteCode: string) => {
        console.log(`redeem invite=${inviteCode}`);

        this.scene.stop('lobby');
        this.scene.launch('game', {
            online: true,
            inviteCode: inviteCode
        });
    };

    private printWelcomeScreen = (options: any) => {

        console.log("drawing menu")
        const scale = this.cameras.main.height > 400 ? 1 : 0.5;
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const menuY = [centerY, centerY+75, centerY+150];
        let menuI = 0;

        if(this.titleText) {
            this.titleText.destroy();
        }
        this.titleText = this.addText(centerX, 50, options.title, '50px', '#FFFFFF')
        this.titleText.setOrigin(0.5, 0);
    
        if(this.instructionsText) {
            this.instructionsText.destroy();
        }

        this.instructionsText = this.addText(centerX, centerY-75, 'SELECT MODE:', '30px', '#FFFFFF');
        this.instructionsText.setOrigin(0.5, 0);

        if(options.allowCPU) {
            
            if(this.cpuText) {
                this.cpuText.destroy();
                this.cpuText.off('pointerdown')
            }
            this.cpuText = this.addText(centerX, menuY[menuI++], 'CPU', '60px', '#FFFFFF', this.playCpu);  
            this.cpuText.setOrigin(0.5);
        }
 
        if(this.playerText) {
            this.playerText.destroy();
            this.playerText.off('pointerdown');
        }
        this.playerText = this.addText(centerX, menuY[menuI++], 'Player', '60px', '#FFFFFF', this.playOnline);
        this.playerText.setOrigin(0.5);

        if(this.inviteText?.active) {
            this.inviteText.destroy();
            this.inviteText.off('pointerdown');
        }
        this.inviteText = this.addText(centerX, menuY[menuI++], 'Invite', '60px', '#FFFFFF', this.invitePlayer);
        this.inviteText.setOrigin(0.5);

        if(!('contacts' in navigator)) {
            this.inviteText.setVisible(false);
        }

        if(this.fullscreen) {
            this.fullscreen.destroy();
            this.fullscreen.off("pointerdown");
        }
        this.fullscreen = this.addImage(this.cameras.main.width-25, 20, 'full-screen', this.toggleFullscreen);
        this.fullscreen.setScale(0.25, 0.25);
        this.fullscreen.setVisible(this.isMobile);
        this.fullscreen.setAlpha(0.4);
    }

    get isMobile() {
        return 'contacts' in navigator;
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
}