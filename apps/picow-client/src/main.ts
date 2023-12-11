import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { HUD } from "./scenes/HUD";
import { LobbyScene } from "./scenes/LobbyScene";

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 },
        }
    },
    backgroundColor: 'black',
    scene: [LobbyScene]
} as Phaser.Types.Core.GameConfig;

const game = new Phaser.Game(config);
game.scene.add('game', GameScene);
game.scene.add('hud', HUD);

game.scene.start('lobby', { 
    title: 'PICOW'
});