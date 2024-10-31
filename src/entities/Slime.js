import Phaser from "phaser";
import Graphics from "../assets/Graphics.js";

const speed = 20;

/**
 * @typedef {Object} TSlime
 * @prop {Phaser.Physics.Arcade.Sprite} sprite
 * @prop {Phaser.Physics.Arcade.Body} body
 * @prop {number} nextAction
 */

/**
 * @class Slime
 * @description The slime entity
 * @type {TSlime}
 */
export default class Slime {
	/**
	 * Creates a new Slime entity.
	 * @param {number} x - The x position of the Slime.
	 * @param {number} y - The y position of the Slime.
	 * @param {Phaser.Scene} scene - The scene the Slime is in.
	 */
	constructor(x, y, scene) {
		this.sprite = scene.physics.add.sprite(x, y, Graphics.slime.name, 0);
		this.sprite.setSize(12, 10);
		this.sprite.setOffset(10, 14);
		this.sprite.anims.play(Graphics.slime.animations.idle.key);
		this.sprite.setDepth(10);

		// @ts-ignore
		this.body = this.sprite.body;
		this.nextAction = 0;
		this.body.bounce.set(0, 0);
		this.body.setImmovable(true);
	}

	/**
	 * Updates the slime's state based on the current game time.
	 * 
	 * This method controls the slime's animation and movement direction
	 * by randomly choosing to either idle or move in one of four directions.
	 * If moving, it ensures the slime doesn't move into blocked areas.
	 * The next action time is randomized to occur between 1 to 3 seconds.
	 *
	 * @param {number} time - The current game time in milliseconds.
	 */
	update(time) {
		if (time < this.nextAction) {
			return;
		}

		if (Phaser.Math.Between(0, 1) === 0) {
			this.body.setVelocity(0);
			this.sprite.anims.play(Graphics.slime.animations.idle.key, true);
		} else {
			this.sprite.anims.play(Graphics.slime.animations.move.key, true);
			const direction = Phaser.Math.Between(0, 3);
			this.body.setVelocity(0);

			if (!this.body.blocked.left && direction === 0) {
				this.body.setVelocityX(-speed);
			} else if (!this.body.blocked.right && direction <= 1) {
				this.body.setVelocityX(speed);
			} else if (!this.body.blocked.up && direction <= 2) {
				this.body.setVelocityY(-speed);
			} else if (!this.body.blocked.down && direction <= 3) {
				this.body.setVelocityY(speed);
			} else {
				console.log(`Couldn't find direction for slime: ${direction}`);
			}
		}

		this.nextAction = time + Phaser.Math.Between(1000, 3000);
	}

	/**
	 * Animates the slime's death animation and disables its physics body.
	 */
	kill() {
		this.sprite.anims.play(Graphics.slime.animations.death.key, false);
		this.sprite.disableBody();
	}
}
