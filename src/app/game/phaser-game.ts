import Phaser from "phaser";
import { StartScene } from "./scenes/StartScene";
import { MainScene } from "./scenes/MainScene";

export const initPhaserGame = (parentElement: HTMLDivElement | null): Phaser.Game | null => {
    if (!parentElement) return null;

    const maxWidth = 430; // Max Width iPhone
    const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: Math.min(Math.max(window.innerWidth, 320), 430),
        // height: Math.min(Math.max(window.innerHeight, 568), 932),
        height: window.innerHeight,

        backgroundColor: '#000000',
        physics: { default: "arcade", arcade: { debug: false } },
        scale: {
            mode: Phaser.Scale.FIT, // Support changing screen size 
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent: parentElement,
        render: {
            antialias: true,
            pixelArt: false,
            roundPixels: false
        },
        scene: [StartScene, MainScene]
    });

    // const resizeGame = () => {
    //     if (game && game.isRunning) { // Проверяем, запущен ли Phaser
    //         game.scale.setGameSize(Math.min(window.innerWidth, maxWidth), window.innerHeight);
    //     }
    // };

    // window.addEventListener("resize", resizeGame);

    return game;
};
