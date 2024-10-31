import Graphics from "../assets/Graphics.js";
import Map from "./Map.js";
import { Mrpas } from "mrpas";
import Phaser from "phaser";

const radius = 7;
const fogAlpha = 0.8;

const lightDropoff = [0.7, 0.6, 0.3, 0.1];

// Alpha to transition per MS given maximum distance between desired
// and actual alpha
const alphaPerMs = 0.004;

/**
 * Updates a tile's alpha to transition towards a desired value.
 * @param {number} desiredAlpha
 * @param {number} delta
 * @param {Phaser.Tilemaps.Tile} tile
 */
function updateTileAlpha(desiredAlpha, delta, tile) {
	// Update faster the further away we are from the desired value,
	// but restrict the lower bound so we don't get it slowing
	// down infinitley.
	const distance = Math.max(Math.abs(tile.alpha - desiredAlpha), 0.05);
	const updateFactor = alphaPerMs * delta * distance;
	if (tile.alpha > desiredAlpha) {
		tile.setAlpha(Phaser.Math.MinSub(tile.alpha, updateFactor, desiredAlpha));
	} else if (tile.alpha < desiredAlpha) {
		tile.setAlpha(Phaser.Math.MaxAdd(tile.alpha, updateFactor, desiredAlpha));
	}
}

/**
 * @class FOVLayer
 * @param {Map} map
 * @prop {Map} map
 * @prop {Phaser.Tilemaps.DynamicTilemapLayer} layer
 * @prop {Mrpas?} mrpas
 * @prop {Phaser.Math.Vector2} lastPos
 */
export default class FOVLayer {
	/** @param {Map} map */
	constructor(map) {
		const utilTiles = map.tilemap.addTilesetImage("util");
		/** @type {Phaser.Tilemaps.DynamicTilemapLayer} */
		this.layer = map.tilemap
			.createBlankDynamicLayer("FOV", utilTiles, 0, 0)
			// .createBlankDynamicLayer("Dark", utilTiles, 0, 0)
			.fill(Graphics.util.indices.black);
		this.layer.setDepth(100);
		/** @type {Mrpas?} */
		this.mrpas = undefined;
		/** @type {Map} */
		this.map = map;
		this.recalculate();
		/** @type {Phaser.Math.Vector2} */
		this.lastPos = new Phaser.Math.Vector2({ x: -1, y: -1 });
	}

	recalculate() {
		this.mrpas = new Mrpas(
			this.map.width,
			this.map.height,
			/**
			 * @param {number} x 
			 * @param {number} y 
			 */
			(x, y) => {
				return this.map.tiles[y] && !this.map.tiles[y][x].collides;
			}
		);
	}

	/**
	 * Updates the FOV layer based on the player's position, camera bounds, and time delta.
	 * Recalculates the MRPAS if the player's position has changed.
	 * Adjusts the alpha of each tile within the specified bounds to match the desired alpha.
	 *
	 * @param {Phaser.Math.Vector2} pos - The current position of the player in tile coordinates.
	 * @param {Phaser.Geom.Rectangle} bounds - The bounds of the camera view in tile coordinates.
	 * @param {number} delta - The time delta since the last update, in milliseconds.
	 */
	update(pos, bounds, delta) {
		if (!this.lastPos.equals(pos)) {
			this.updateMRPAS(pos);
			this.lastPos = pos.clone();
		}

		for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
			for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
				if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
					continue;
				}
				const desiredAlpha = this.map.tiles[y][x].desiredAlpha;
				const tile = this.layer.getTileAt(x, y);
				updateTileAlpha(desiredAlpha, delta, tile);
			}
		}
	}

	/**
	 * Recalculates the MRPAS (Multi-Radius Perfect Angular Shadowcasting) field
	 * based on the player's position and desired radius.
	 * Sets the `desiredAlpha` of each tile within the shadowcasting radius to 0,
	 * and sets the `seen` flag to true.
	 * @param {Phaser.Math.Vector2} pos - The current position of the player in tile coordinates.
	 */
	updateMRPAS(pos) {
		// TODO: performance?
		for (let row of this.map.tiles) {
			for (let tile of row) {
				if (tile.seen) {
					tile.desiredAlpha = fogAlpha;
				}
			}
		}

		this.mrpas?.compute(
			pos.x,
			pos.y,
			radius,
			/**
			 * @param {number} x 
			 * @param {number} y 
			 */
			(x, y) => this.map.tiles[y][x].seen,
			/**
			 * @param {number} x 
			 * @param {number} y 
			 */
			(x, y) => {
				const distance = Math.floor(
					new Phaser.Math.Vector2(x, y).distance(
						new Phaser.Math.Vector2(pos.x, pos.y)
					)
				);

				const rolloffIdx = distance <= radius ? radius - distance : 0;
				const alpha = rolloffIdx < lightDropoff.length ? lightDropoff[rolloffIdx] : 0;
				this.map.tiles[y][x].desiredAlpha = alpha;
				this.map.tiles[y][x].seen = true;
			}
		);
	}
}
