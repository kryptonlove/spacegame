// @ts-ignore

import * as Phaser from "phaser";

export class MainScene extends Phaser.Scene {
    score!: number;
    lives!: number;
    gameOver!: boolean;
    isPaused!: boolean;
    lastBulletTime!: number;
    bulletCooldown!: number;
    isInvulnerable!: boolean;
    scoreText!: Phaser.GameObjects.Text;
    livesText!: Phaser.GameObjects.Text;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    pauseButton!: Phaser.GameObjects.Text;
    bullets!: Phaser.Physics.Arcade.Group;
    enemies!: Phaser.Physics.Arcade.Group;
    moveDirection!: number;
    moving!: boolean;
    moveButton!: Phaser.GameObjects.Text;
    shootButton!: any;
    enemySpawnEvent!: Phaser.Time.TimerEvent;
    enemy: any;
    body: any;
    enemySpeed!: number;
    enemySpawnDelay!: number;
    difficultyTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: "MainScene" });
    }

    preload() {
        this.load.spritesheet("player", "https://kryptonlove.files.show/poopman-sprite.png", {frameWidth: 128, frameHeight: 128});
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

        // UI: PAUSE BUTTON , SCORE, LIVES
        this.pauseButton = this.add.text(this.scale.width * 0.05, 20, "PAUSE", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', color: "#fff", backgroundColor: "#444" })
            .setInteractive()
            .on("pointerdown", () => this.togglePause());
        this.scoreText = this.add.text(this.scale.width * 0.95, 20, "SCORE: 0", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', color: "#fff" }).setOrigin(1.0, 0.0);
        this.livesText = this.add.text(this.scale.width * 0.95, 40, "LIVES: 2", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', color: "#fff" }).setOrigin(1.0, 0.0);

        // Difficulity — NEW
        this.enemySpeed = -50;
        this.enemySpawnDelay = 2500;
        
        this.difficultyTimer = this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                this.enemySpeed -= 20;
                this.enemySpawnDelay = Math.max(500, this.enemySpawnDelay - 100);
                this.enemySpawnEvent.reset({
                    delay: this.enemySpawnDelay,
                    loop: true,
                    callback: this.enemySpawnEvent.callback,
                    callbackScope: this.enemySpawnEvent.callbackScope
                });
            }
        });

        // PLAYER
        this.anims.create({
            key: "player_move",
            frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        this.player = this.physics.add.sprite(this.scale.width * 0.5, 150, "player");
        this.player.anims.play("player_move");
        this.player.body.setSize(64, 64); // hitbox 64x64 inside of 128x128
        this.player.setOffset(32, 32); // centering
        this.player.setCollideWorldBounds(true);
        this.player.body.onWorldBounds = true;
        this.player.body.bounce.set(0);

        // WORLD BOUNDS
        this.physics.world.setBounds(10, 10, this.scale.width - 20, this.scale.height - 140, true, true, true, true);

        // SPRITE ANIMATIONS FOR ENEMIES
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

        // PLAYER MOVES
        this.moveDirection = 1;
        this.moving = false;

        // KEYBOARD CONTROLS
        if (this.input.keyboard) {
            this.input.keyboard.on("keydown-D", () => this.movePlayer());
            this.input.keyboard.on("keydown-F", () => this.shootBullet());
        }

        // MOVE TEXT BUTTON 
        this.moveButton = this.add.text(20, this.scale.height - 60, "← MOVE →", {
            fontSize: "20px",
            fontFamily: 'Orbitron, sans-serif',
            color: "#FFFFFF",
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
        
        // SPAWN DELAY — NEW 
        this.enemySpawnEvent = this.time.addEvent({
            delay: this.enemySpawnDelay,
            loop: true,
            callback: () => {
                if (!this.gameOver && !this.isPaused) {
                    let enemy = this.enemies.create(Phaser.Math.Between(50, this.scale.width - 50), this.physics.world.bounds.bottom - 50, "enemy");
                    enemy.setScale(0.8);
                    enemy.anims.play("enemy_move");

                    if (enemy) {
                        enemy.setActive(true).setVisible(true);
                        this.physics.add.existing(enemy);
                        enemy.body.setVelocityY(this.enemySpeed);
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


            // BULLET AND ENEMY COLLISION
            const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

            if (enemySprite && enemySprite.body instanceof Phaser.Physics.Arcade.Body) {
                enemySprite.body.enable = false;
                enemySprite.setVelocity(0, 0);
                enemySprite.setActive(false);
                enemySprite.setVisible(false);
            }

            if (this.lives <= 0) {
                this.gameOver = true;
                this.physics.pause();
                
                // TEXT
                this.add.text(this.scale.width * 0.5, this.scale.height * 0.2, `Game Over`, {
                    fontSize: "32px",
                    fontFamily: 'Orbitron, sans-serif',
                    color: "#fff"
                })
                .setOrigin(0.5);
                this.add.text(this.scale.width * 0.5, this.scale.height * 0.3, `High Score: ${this.score}`, {
                    fontSize: "20px",
                    fontFamily: 'Orbitron, sans-serif',
                    color: "#fff"
                })
                .setOrigin(0.5);
                this.add.text(this.scale.width * 0.5, this.scale.height * 0.4, `Share result on Twitter, follow @digglefun and get SHMIGGLE airdrop`, {
                    fontSize: "16px",
                    fontFamily: 'Orbitron, sans-serif',
                    color: "#fff",
                    align: "center",
                    wordWrap: { width: this.scale.width * 0.9 }
                }).setOrigin(0.5);

                // SHARE ON TWITTER BUTTON
                let tweetText = encodeURIComponent(`I fought off cosmic snakes in Space Flush and scored ${this.score}. Can you beat my score and earn some shmiggle? @digglefun`);
                let tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=https://spaceflush.diggle.fun`;

                let shareButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.6, "SHARE ON TWITTER", {
                    fontSize: "20px",
                    fontFamily: 'Orbitron, sans-serif',
                    color: "#000",
                    backgroundColor: "#07D4FF",
                })
                .setOrigin(0.5)
                .setInteractive()
                .setPadding(this.scale.width, 5)
                .on("pointerdown", () => {
                    window.open(tweetUrl, "_blank");
                });

                // START AGAIN BUTTON
                let restartButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, "START AGAIN", { fontSize: "20px", fontFamily: 'Orbitron, sans-serif', color: "#000", backgroundColor: "#FFA900" })
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
            this.player.setVelocityX(this.moveDirection * 700); // PLAYER SPEED 
            if (this.player.body.blocked.left || this.player.body.blocked.right) {
            this.moving = false;
            this.player.setVelocityX(0);
            }
        }

        this.bullets.children.iterate((bullet) => {
            const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
            if (bulletSprite && bulletSprite.y > this.scale.height - 140) {
                bulletSprite.destroy();
            }
            return null;
        });

        this.enemies.children.iterate((enemy) => {
            const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
            if (enemySprite && enemySprite.y < 140) {
                enemySprite.destroy();
            }
            return null;
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