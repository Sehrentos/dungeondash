import Phaser from "phaser";
import Graphics from "../assets/Graphics.js";

const speed = 125;
const attackSpeed = 500;
const attackDuration = 165;
const staggerDuration = 200;
const staggerSpeed = 100;
const attackCooldown = attackDuration * 2;

/**
 * @typedef {Object} Keys {
 * @prop {Phaser.Input.Keyboard.Key} up
 * @prop {Phaser.Input.Keyboard.Key} down
 * @prop {Phaser.Input.Keyboard.Key} left
 * @prop {Phaser.Input.Keyboard.Key} right
 * @prop {Phaser.Input.Keyboard.Key} space
 * @prop {Phaser.Input.Keyboard.Key} w
 * @prop {Phaser.Input.Keyboard.Key} a
 * @prop {Phaser.Input.Keyboard.Key} s
 * @prop {Phaser.Input.Keyboard.Key} d
 * 
 * @typedef {Object} TPlayer
 * @prop {Phaser.Physics.Arcade.Sprite} sprite
 * @prop {Keys} keys
 * @prop {number} attackUntil
 * @prop {number} staggerUntil
 * @prop {number} attackLockedUntil
 * @prop {Phaser.GameObjects.Particles.ParticleEmitter} emitter
 * @prop {Phaser.GameObjects.Particles.ParticleEmitter} flashEmitter
 * @prop {Phaser.Physics.Arcade.Body} body
 * @prop {boolean} attacking
 * @prop {number} time
 * @prop {boolean} staggered
 * @prop {boolean} facingUp
 */

/**
 * @class Player
 * @description The player entity
 * @type {TPlayer}
 */
export default class Player {
	/**
	 * Constructor for the Player entity.
	 * @param {number} x - The X position of the player.
	 * @param {number} y - The Y position of the player.
	 * @param {Phaser.Scene} scene - The scene the player is in.
	 * 
	 */
	constructor(x, y, scene) {
		this.scene = scene;
		this.sprite = scene.physics.add.sprite(x, y, Graphics.player.name, 0);
		this.sprite.setSize(8, 8);
		this.sprite.setOffset(20, 28);
		this.sprite.anims.play(Graphics.player.animations.idle.key);
		this.facingUp = false;
		this.sprite.setDepth(5);

		// @ts-ignore
		this.keys = scene.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.UP,
			down: Phaser.Input.Keyboard.KeyCodes.DOWN,
			left: Phaser.Input.Keyboard.KeyCodes.LEFT,
			right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
			space: Phaser.Input.Keyboard.KeyCodes.SPACE,
			w: "w",
			a: "a",
			s: "s",
			d: "d"
		});

		this.attackUntil = 0;
		this.attackLockedUntil = 0;
		this.attacking = false;
		this.staggerUntil = 0;
		this.staggered = false;
		const particles = scene.add.particles(Graphics.player.name);
		particles.setDepth(6);
		this.emitter = particles.createEmitter({
			alpha: { start: 0.7, end: 0, ease: "Cubic.easeOut" },
			follow: this.sprite,
			quantity: 1,
			lifespan: 200,
			blendMode: Phaser.BlendModes.ADD,
			scaleX: () => (this.sprite.flipX ? -1 : 1),
			/** @param {Phaser.GameObjects.Particles.Particle} particle */
			emitCallback: (particle) => {
				particle.frame = this.sprite.frame;
			}
		});
		this.emitter.stop();

		this.flashEmitter = particles.createEmitter({
			alpha: { start: 0.5, end: 0, ease: "Cubic.easeOut" },
			follow: this.sprite,
			quantity: 1,
			lifespan: 100,
			scaleX: () => (this.sprite.flipX ? -1 : 1),
			/** @param {Phaser.GameObjects.Particles.Particle} particle */
			emitCallback: (particle) => {
				particle.frame = this.sprite.frame;
			}
		});
		this.flashEmitter.stop();

		// @ts-ignore
		this.body = this.sprite.body;
		this.time = 0;
	}

	/**
	 * Is the player currently in the middle of an attack?
	 * @return {boolean} True if the player is currently attacking.
	 */
	isAttacking() {
		return this.attacking;
	}

	/**
	 * Start a stagger effect, if the player is not already staggered.
	 *
	 * If the current time is greater than the last stagger time, then
	 * the player is staggered. This causes the camera to shake and flash.
	 *
	 * TODO: Implement the actual stagger effect (e.g. slow down the player).
	 */
	stagger() {
		if (this.time > this.staggerUntil) {
			this.staggered = true;
			// TODO
			this.scene.cameras.main.shake(150, 0.001);
			this.scene.cameras.main.flash(50, 100, 0, 0);
		}
	}

	/**
	 * Main update loop for the player.
	 *
	 * This function is called every frame and is responsible for updating
	 * the player's state based on user input and other events.
	 *
	 * @param {number} time - The current game time in milliseconds.
	 */
	update(time) {
		this.time = time;
		const keys = this.keys;
		let attackAnim = "";
		let moveAnim = "";

		if (this.staggered && !this.body.touching.none) {
			this.staggerUntil = this.time + staggerDuration;
			this.staggered = false;

			this.body.setVelocity(0);
			if (this.body.touching.down) {
				this.body.setVelocityY(-staggerSpeed);
			} else if (this.body.touching.up) {
				this.body.setVelocityY(staggerSpeed);
			} else if (this.body.touching.left) {
				this.body.setVelocityX(staggerSpeed);
				this.sprite.setFlipX(true);
			} else if (this.body.touching.right) {
				this.body.setVelocityX(-staggerSpeed);
				this.sprite.setFlipX(false);
			}
			this.sprite.anims.play(Graphics.player.animations.stagger.key);

			this.flashEmitter.start();
			// this.sprite.setBlendMode(Phaser.BlendModes.MULTIPLY);
		}

		if (time < this.attackUntil || time < this.staggerUntil) {
			return;
		}

		this.body.setVelocity(0);

		const left = keys.left.isDown || keys.a.isDown;
		const right = keys.right.isDown || keys.d.isDown;
		const up = keys.up.isDown || keys.w.isDown;
		const down = keys.down.isDown || keys.s.isDown;

		if (!this.body.blocked.left && left) {
			this.body.setVelocityX(-speed);
			this.sprite.setFlipX(true);
		} else if (!this.body.blocked.right && right) {
			this.body.setVelocityX(speed);
			this.sprite.setFlipX(false);
		}

		if (!this.body.blocked.up && up) {
			this.body.setVelocityY(-speed);
		} else if (!this.body.blocked.down && down) {
			this.body.setVelocityY(speed);
		}

		if (left || right) {
			moveAnim = Graphics.player.animations.walk.key;
			attackAnim = Graphics.player.animations.slash.key;
			this.facingUp = false;
		} else if (down) {
			moveAnim = Graphics.player.animations.walk.key;
			attackAnim = Graphics.player.animations.slashDown.key;
			this.facingUp = false;
		} else if (up) {
			moveAnim = Graphics.player.animations.walkBack.key;
			attackAnim = Graphics.player.animations.slashUp.key;
			this.facingUp = true;
		} else if (this.facingUp) {
			moveAnim = Graphics.player.animations.idleBack.key;
		} else {
			moveAnim = Graphics.player.animations.idle.key;
		}

		if (
			keys.space?.isDown &&
			time > this.attackLockedUntil &&
			this.body.velocity.length() > 0
		) {
			this.attackUntil = time + attackDuration;
			this.attackLockedUntil = time + attackDuration + attackCooldown;
			this.body.velocity.normalize().scale(attackSpeed);
			this.sprite.anims.play(attackAnim, true);
			this.emitter.start();
			this.sprite.setBlendMode(Phaser.BlendModes.ADD);
			this.attacking = true;
			return;
		}

		this.attacking = false;
		this.sprite.anims.play(moveAnim, true);
		this.body.velocity.normalize().scale(speed);
		this.sprite.setBlendMode(Phaser.BlendModes.NORMAL);
		if (this.emitter.on) {
			this.emitter.stop();
		}
		if (this.flashEmitter.on) {
			this.flashEmitter.stop();
		}
	}
}
