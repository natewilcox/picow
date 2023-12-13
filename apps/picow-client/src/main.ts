import Phaser from "phaser";
import * as data from "./version.json";
import { GameScene } from "./scenes/GameScene";
import { HUD } from "./scenes/HUD";
import { LobbyScene } from "./scenes/LobbyScene";
import { addBuildInfo } from "@natewilcox/version-meta";

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

// adds build info to the window object
addBuildInfo(data);