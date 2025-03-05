import Phaser from "phaser";

export class MainScene extends Phaser.Scene {

    constructor() {
        super({ key: "MainScene" });
    }

    preload() {
        this.load.image("player", "https://kryptonlove.files.show/poopman.png");
        this.load.image("bullet", "https://kryptonlove.files.show/poop.png");
        this.load.spritesheet("enemy", "https://kryptonlove.files.show/snake-sprite.png", {frameWidth: 128, frameHeight: 128});
    }

    create() {
        this.score = 0;
        this.lives = 2;
        this.gameOver = false;
        this.isPaused = false;
        this.lastBulletTime = 0;
        this.bulletCooldown = 200;
        this.isInvulnerable = false;

        // Pause button, score and lives
        this.pauseButton = this.add.text(this.scale.width * 0.05, 20, "PAUSE", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', fill: "#fff", backgroundColor: "#444" })
            .setInteractive()
            .on("pointerdown", () => this.togglePause());
        this.scoreText = this.add.text(this.scale.width * 0.95, 20, "SCORE: 0", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', fill: "#fff" }).setOrigin(1.0, 0.0);
        this.livesText = this.add.text(this.scale.width * 0.95, 40, "LIVES: 2", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', fill: "#fff" }).setOrigin(1.0, 0.0);

        this.player = this.physics.add.sprite(this.scale.width * 0.5, 150, "player");
        this.player.body.setSize(this.player.width, this.player.height);
        this.player.setOffset(this.player.width * 0.1, this.player.height * 0.05);
        this.player.setCollideWorldBounds(true);
        this.player.body.onWorldBounds = true;
        this.player.body.bounce.set(0);
        this.physics.world.setBounds(10, 10, this.scale.width - 20, this.scale.height - 140, true, true, true, true);

        // const graphics = this.add.graphics();
        // graphics.lineStyle(2, 0xff0000, 1); // red bound, stroke width 2px
        // graphics.strokeRect(10, 10, this.scale.width - 20, this.scale.height - 140);

        // Sprite animation for enemies
        this.anims.create({
        key: "enemy_move",
        frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 1 }),
        frameRate: 4,
        repeat: -1
        });

        this.bullets = this.physics.add.group({
            defaultKey: "bullet",
            maxSize: 100,
            runChildUpdate: true
        });
        this.enemies = this.physics.add.group({
            defaultKey: "enemy",
            maxSize: 10,
            runChildUpdate: true
        });

        // Player moves
        this.moveDirection = 1;
        this.moving = false;

        // KEYBOARD CONTROLS
        this.input.keyboard.on("keydown-D", () => this.movePlayer());
        this.input.keyboard.on("keydown-F", () => this.shootBullet());

        // MOVE TEXT BUTTON 
        this.moveButton = this.add.text(20, this.scale.height - 60, "← MOVE →", {
            fontSize: "20px",
            fontFamily: 'Orbitron, sans-serif',
            fill: "#FFFFFF",
            backgroundColor: "#3D3D3D",
            padding: { x: 40, y: 20 }
        }).setInteractive().setOrigin(0, 1);
        this.moveButton.on("pointerdown", () => this.movePlayer());

        // FLUSH TEXT BUTTON
        this.shootButton = this.add.text(this.scale.width - 20, this.scale.height - 60, "FLUSH", {
            fontSize: "20px",
            fontFamily: 'Orbitron, sans-serif',
            color: "#000000",
            backgroundColor: "#07D4FF",
            padding: { x: 20, y: 20 }
        }).setInteractive().setOrigin(1, 1);
        this.shootButton.on("pointerdown", () => this.shootBullet());

        this.enemySpawnEvent = this.time.addEvent({
            delay: 2500,
            loop: true,
            callback: () => {
                if (!this.gameOver && !this.isPaused) {
                    let enemy = this.enemies.create(Phaser.Math.Between(50, this.scale.width - 50), this.physics.world.bounds.bottom - 50, "enemy");
                    enemy.setScale(0.8);
                    enemy.anims.play("enemy_move");

                    if (enemy) {
                        enemy.setActive(true).setVisible(true);
                        this.physics.add.existing(enemy);
                        enemy.body.setVelocityY(-50);
                        enemy.checkWorldBounds = true;
                        enemy.outOfBoundsKill = true;
                    }
                }
            }
        });

        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            bullet.destroy();
            enemy.destroy();
            this.score++;
            this.scoreText.setText(`SCORE: ${this.score}`);
        });

        this.physics.add.overlap(this.enemies, this.player, (player, enemy) => {
            if (!this.isInvulnerable && !this.gameOver) {
                this.isInvulnerable = true;
                this.lives--;
                this.livesText.setText(`Lives: ${this.lives}`);

        // Делаем врага невидимым и отключаем физику перед удалением
        enemy.body.enable = false;
        enemy.setVelocity(0, 0);
                enemy.setActive(false);
                enemy.setVisible(false);

                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.physics.pause();
                    this.add.text(this.scale.width * 0.5, this.scale.height * 0.2, `Game Over`, { fontSize: "32px", fontFamily: 'Orbitron, sans-serif', fill: "#fff" }).setOrigin(0.5);
                    this.add.text(this.scale.width * 0.5, this.scale.height * 0.4, `High Score: ${this.score}`, { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', fill: "#fff" }).setOrigin(0.5);
                    
                    let restartButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, "START AGAIN", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', fill: "#000", backgroundColor: "#FFA900" })
                        .setOrigin(0.5)
                        .setInteractive()
                        .setPadding(this.scale.width, 5)
                        .on("pointerdown", () => {
                            this.scene.restart();
                        });
                } else {
                    this.tweens.add({
                        targets: this.player,
                        alpha: 0.3,
                        duration: 200,
                        ease: 'Linear',
                        repeat: 3,
                        yoyo: true,
                        onComplete: () => {
                            this.player.setAlpha(1);
                            this.isInvulnerable = false;
                        }
                    });
                }

                this.time.delayedCall(50, () => {
                    enemy.destroy();
                });
            }
        });
    }

    update() {
        if (this.isPaused || this.gameOver) {
            return;
        }

        if (this.moving) {
            this.player.setVelocityX(this.moveDirection * 200);
            if (this.player.body.blocked.left || this.player.body.blocked.right) {
            this.moving = false;
            this.player.setVelocityX(0);
            }
        }

        this.bullets.children.iterate((bullet) => {
            if (bullet && bullet.y > this.scale.height - 140) {
                bullet.destroy();
            }
        });

        this.enemies.children.iterate((enemy) => {
            if (enemy && enemy.y < 140) {
                enemy.destroy();
            }
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseButton.setText(this.isPaused ? "RESUME" : "PAUSE");
        if (this.isPaused) {
            this.physics.pause();
            this.enemySpawnEvent.paused = true;
        } else {
            this.physics.resume();
            this.enemySpawnEvent.paused = false;
        }
    }

    movePlayer() {
        if (!this.isPaused) {
            this.moveDirection *= -1;
            this.moving = true;
        }
    }

    shootBullet() {
        if (!this.isPaused && this.time.now - this.lastBulletTime > this.bulletCooldown) {
            this.lastBulletTime = this.time.now;
            let bullet = this.bullets.get(this.player.x, this.player.y + 45, "bullet");
            if (bullet) {
                bullet.setActive(true).setVisible(true);
                bullet.body.enable = true;
                bullet.body.setVelocityY(200);
            }
        }
    }

}

// export class MainScene extends Phaser.Scene {

//     private score: number = 0;
//     private lives: number = 2;
//     private gameOver: boolean = false;
//     private isPaused: boolean = false;
//     private lastBulletTime: number = 0;
//     private bulletCooldown: number = 200;
//     private isInvulnerable: boolean = false;
//     private pauseButton!: Phaser.GameObjects.Text;
//     private scoreText!: Phaser.GameObjects.Text;
//     private livesText!: Phaser.GameObjects.Text;
//     private player!: Phaser.Physics.Arcade.Sprite;
//     private bullets!: Phaser.Physics.Arcade.Group;
//     private enemies!: Phaser.Physics.Arcade.Group;
//     private moveDirection: number = 1;
//     private moving: boolean = false;
//     private enemySpawnEvent!: Phaser.Time.TimerEvent;

//     constructor() {
//         super({ key: "MainScene" });
//     }

//     preload() {
//         this.load.css('google-fonts', 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
//         this.load.image("player", "https://kryptonlove.files.show/poopman.png");
//         this.load.image("bullet", "https://kryptonlove.files.show/poop.png");
//         this.load.spritesheet("enemy", "https://kryptonlove.files.show/snake-sprite.png", {frameWidth: 128, frameHeight: 128});
//     }

//     create() {
//         this.score = 0;
//         this.lives = 2;
//         this.gameOver = false;
//         this.isPaused = false;
//         this.lastBulletTime = 0;
//         this.bulletCooldown = 200;
//         this.isInvulnerable = false;

//         // Pause button, score and lives
//         this.pauseButton = this.add.text(this.scale.width * 0.05, 20, "PAUSE", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', color: "#fff", backgroundColor: "#444" })
//             .setInteractive()
//             .on("pointerdown", () => this.togglePause());
//         this.scoreText = this.add.text(this.scale.width * 0.95, 20, "SCORE: 0", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', color: "#fff" }).setOrigin(1.0, 0.0);
//         this.livesText = this.add.text(this.scale.width * 0.95, 40, "LIVES: 2", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', color: "#fff" }).setOrigin(1.0, 0.0);


//         this.player = this.physics.add.sprite(this.scale.width * 0.5, 150, "player");
//         this.player.body.setSize(this.player!.width, this.player!.height);
//         this.player.setOffset(this.player.width * 0.1, this.player.height * 0.05);
//         this.player.setCollideWorldBounds(true);
//         this.player.body.onWorldBounds = true;
//         this.player.body.bounce.set(0);
//         this.physics.world.setBounds(10, 10, this.scale.width - 10, this.scale.height, true, true, true, true);

//         // Sprite animation for enemies
//         this.anims.create({
//         key: "enemy_move",
//         frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 1 }),
//         frameRate: 4,
//         repeat: -1
//         });

//         this.bullets = this.physics.add.group({
//             defaultKey: "bullet",
//             maxSize: 10,
//             runChildUpdate: true
//         });
//         this.enemies = this.physics.add.group({
//             defaultKey: "enemy",
//             maxSize: 10,
//             runChildUpdate: true
//         });
//         this.moveDirection = 1;
//         this.moving = false;

//         // Controls
//         this.input.keyboard.on("keydown-D", () => {
//             if (!this.isPaused) {
//                 this.moveDirection *= -1;
//                 this.moving = true;
//             }
//         });

//         this.input.keyboard.on("keydown-F", () => {
//             if (!this.isPaused && this.time.now - this.lastBulletTime > this.bulletCooldown) {
//                 this.lastBulletTime = this.time.now;
//                 let bullet = this.bullets.create(this.player.x, this.player.y + 45, "bullet");
//                 if (bullet) {
//                     bullet.setActive(true).setVisible(true);
//                     this.physics.add.existing(bullet);
//                     bullet.body.setVelocityY(200);
//                     bullet.checkWorldBounds = true;
//                     bullet.outOfBoundsKill = true;
//                 }
//             }
//         });
        
//         this.enemySpawnEvent = this.time.addEvent({
//             delay: 2500,
//             loop: true,
//             callback: () => {
//                 if (!this.gameOver && !this.isPaused) {
//                     let enemy = this.enemies.create(Phaser.Math.Between(50, this.scale.width - 50), 800, "enemy");
//                     enemy.setScale(0.8);
//                     enemy.anims.play("enemy_move");

//                     if (enemy) {
//                         enemy.setActive(true).setVisible(true);
//                         this.physics.add.existing(enemy);
//                         enemy.body.setVelocityY(-50);
//                         enemy.checkWorldBounds = true;
//                         enemy.outOfBoundsKill = true;
//                     }
//                 }
//             }
//         });

//         this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
//             bullet.destroy();
//             enemy.destroy();
//             this.score++;
//             this.scoreText.setText(`SCORE: ${this.score}`);
//         });

//         this.physics.add.overlap(this.enemies, this.player, (player, enemy) => {
//             if (!this.isInvulnerable && !this.gameOver) {
//                 this.isInvulnerable = true;
//                 this.lives--;
//                 this.livesText.setText(`Lives: ${this.lives}`);

//                 // Делаем врага невидимым и отключаем физику перед удалением
//                 enemy.body.enable = false;
//         enemy.setVelocity(0, 0);
//                 enemy.setActive(false);
//                 enemy.setVisible(false);

//                 if (this.lives <= 0) {
//                     this.gameOver = true;
//                     this.physics.pause();
//                     this.add.text(this.scale.width * 0.5, this.scale.height * 0.2, `Game Over`, { fontSize: "32px", fontFamily: 'Orbitron, sans-serif', fill: "#fff" }).setOrigin(0.5);
//                     this.add.text(this.scale.width * 0.5, this.scale.height * 0.4, `High Score: ${this.score}`, { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', fill: "#fff" }).setOrigin(0.5);
                    
//                     let restartButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, "START AGAIN", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', fill: "#000", backgroundColor: "#FFA900" })
//                         .setOrigin(0.5)
//                         .setInteractive()
//                         .setPadding(this.scale.width, 5)
//                         .on("pointerdown", () => {
//                             this.scene.restart();
//                         });
//                 } else {
//                     this.tweens.add({
//                         targets: this.player,
//                         alpha: 0.3,
//                         duration: 200,
//                         ease: 'Linear',
//                         repeat: 3,
//                         yoyo: true,
//                         onComplete: () => {
//                             this.player.setAlpha(1);
//                             this.isInvulnerable = false;
//                         }
//                     });
//                 }

//                 this.time.delayedCall(50, () => {
//                     enemy.destroy();
//                 });
//             }
//         });
//     }

//     update() {
//         if (this.isPaused || this.gameOver) {
//             return;
//         }

//         if (this.moving) {
//             this.player.setVelocityX(this.moveDirection * 200);
//             if (this.player.body.blocked.left || this.player.body.blocked.right) {
//             this.moving = false;
//             this.player.setVelocityX(0);
//                 this.moving = false;
//             }
//         }

//         this.bullets.children.iterate((bullet) => {
//             if (bullet && bullet.y < 0) {
//                 bullet.destroy();
//             }
//         });

//         this.enemies.children.iterate((enemy) => {
//             if (enemy && enemy.y < 0) {
//                 enemy.destroy();
//             }
//         });
//     }

//     togglePause() {
//         this.isPaused = !this.isPaused;
//         this.pauseButton.setText(this.isPaused ? "RESUME" : "PAUSE");
//         if (this.isPaused) {
//             this.physics.pause();
//             this.enemySpawnEvent.paused = true;
//         } else {
//             this.physics.resume();
//             this.enemySpawnEvent.paused = false;
//         }
//     }
// }