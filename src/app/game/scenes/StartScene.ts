import Phaser from "phaser";

// export class StartScene extends Phaser.Scene {
//     constructor() {
//         super({ key: "StartScene" });
//     }

//     preload() {
//         this.load.image("bg", "https://kryptonlove.files.show/poster.png");
//     }

//     create() {
//         this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, "bg")
//         .setOrigin(0.5,0.5)
//         .setDisplaySize(this.scale.width, this.scale.height);

//         this.add.text(this.scale.width * 0.5, this.scale.height * 0.3, "SPACE FLUSH", { 
//             fontSize: 32, 
//             fontFamily: 'Orbitron, sans-serif', 
//             color:"#fff", // changed from fill to color
//             resolution: 2
//         }).setOrigin(0.5);

//         let playButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.6, "PLAY", { 
//             fontSize: 24, 
//             fontFamily: 'Orbitron, sans-serif', 
//             color: "#ff8800", // changed from fill to color
//             backgroundColor: "#000",
//         })
//         .setOrigin(0.5)
//         .setInteractive()
//         .setPadding(this.scale.width, 10)
//         .on("pointerdown", () => {
//             playButton.setStyle({ fill: "#000", backgroundColor: "#ff8800" });
//             this.time.delayedCall(800, () => this.scene.start("MainScene"));
//         });
//     }
// }

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("bg", "https://kryptonlove.files.show/poster.png");
        this.load.css('google-fonts', 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
        
        this.fontsLoaded = false;
        document.fonts.ready.then(() => {
            this.fontsLoaded = true;
        });
    }

    create() {
        this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, "bg")
        .setOrigin(0.5,0.5)
        .setDisplaySize(this.scale.width, this.scale.height);

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.3, "SPACE FLUSH", { 
            fontSize: "32px", 
            fontFamily: 'Orbitron, sans-serif',
            color: "#fff",
            resolution: window.devicePixelRatio,
        })
        .setOrigin(0.5);


        let playButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.6, "PLAY", { 
            fontSize: "28px", 
            fontFamily: 'Orbitron, sans-serif', 
            color: "#ff8800", 
            backgroundColor: "#000",
            resolution: window.devicePixelRatio
        })
        .setOrigin(0.5)
        .setInteractive()
        .setPadding(this.scale.width, 10)
        .on("pointerdown", () => {
            playButton.setStyle({ fill: "#000", backgroundColor: "#ff8800" });
            this.time.delayedCall(800, () => this.scene.start("MainScene"));
        });
    }
}