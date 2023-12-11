import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { LobbyScene } from "@natewilcox/mobile-game";
import { HUD } from "./scenes/HUD";

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
    scene: [LobbyScene, GameScene, HUD]
} as Phaser.Types.Core.GameConfig;

const game = new Phaser.Game(config);

game.scene.start('lobby', { 
    title: 'PICOW'
});