import Phaser from "phaser";
// import Fonts from "../assets/Fonts.js";
// Note: having issue loading bitmap font, use text instead
// text?: Phaser.GameObjects.DynamicBitmapText;
// text?: Phaser.GameObjects.BitmapText;

/**
 * @typedef {Object} TInfoScene
 * @prop {Phaser.GameObjects.Text=} text
 * @prop {number} lastUpdate
 */

/**
 * @class InfoScene
 * @type {TInfoScene}
 */
export default class InfoScene extends Phaser.Scene {
	constructor() {
		super({ key: "InfoScene" });
		this.lastUpdate = 0;
	}

	preload() {
		// this.load.bitmapFont("default", ...Fonts.default);
	}

	create() {
		// this.text = this.add.dynamicBitmapText(25, 25, "default", "", 12);
		// this.text = this.add.bitmapText(25, 25, "", "", 12);
		this.text = this.add.text(25, 25, "");
		this.text.setAlpha(0.7);
		this.lastUpdate = 0;
	}

	/**
	 * Called once per frame.
	 *
	 * Updates the text in the information scene (about once per second).
	 * @param {number} time The current time.
	 * @param {number} delta Time elapsed since the last frame.
	 */
	update(time, delta) {
		if (time > this.lastUpdate + 100) {
			this.text?.setText([
				"Dungeon Dash!",
				"",
				"Use arrow keys to walk around the map!",
				"Press space while moving to dash-attack!",
				"(debug: Q, tilesets: R)",
				"",
				"Credits & more information at",
				"https://github.com/mipearson/dungeondash",
				"",
				"FPS: " + Math.round(this.game.loop.actualFps)
			]);
			this.lastUpdate = time;
		}
	}
}
