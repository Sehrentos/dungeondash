import Map from "./Map.js";
import Graphics from "../assets/Graphics.js";

/**
 * @typedef {Object} TileType Enum for tile types
 * @prop {number} None 0
 * @prop {number} Wall 1
 * @prop {number} Door 2
 * 
 * @typedef {Object} TTile
 * @prop {number} x
 * @prop {number} y
 * @prop {Map} map
 * @prop {typeof TileType.None | typeof TileType.Wall | typeof TileType.Door} type
 * @prop {boolean} collides
 * @prop {boolean} seen
 * @prop {number} desiredAlpha
 * @prop {boolean} corridor
 */

/**
 * @type {TileType} Enum for tile types
 */
export const TileType = {
	None: 0,
	Wall: 1,
	Door: 2
}

/**
 * @class Tile
 * @type {TTile}
 */
export default class Tile {
	/**
	 * Converts a string representation of a tile type to its corresponding TileType enum value.
	 *
	 * @param {string} type - The string representation of the tile type (e.g., "wall", "door").
	 * @returns {typeof TileType.None | typeof TileType.Wall | typeof TileType.Door} - The corresponding TileType enum value (e.g., TileType.Wall, TileType.Door, TileType.None).
	 */
	static tileTypeFor(type) {
		if (type === "wall") {
			return TileType.Wall;
		} else if (type === "door") {
			return TileType.Door;
		}
		return TileType.None;
	}

	/**
	 * Initializes a new instance of the Tile class.
	 *
	 * @param {typeof TileType.None | typeof TileType.Wall | typeof TileType.Door} type - The type of the tile, which determines its properties and behavior.
	 * @param {number} x - The x-coordinate of the tile on the map.
	 * @param {number} y - The y-coordinate of the tile on the map.
	 * @param {Map} map - The map to which this tile belongs.
	 */
	constructor(type, x, y, map) {
		this.type = type;
		this.collides = type !== TileType.None;
		this.map = map;
		this.x = x;
		this.y = y;
		this.seen = false;
		this.desiredAlpha = 1;
		this.corridor = !map.withinRoom(x, y);
	}

	open() {
		this.collides = false;
	}

	/**
	 * Retrieves the neighboring tiles around the current tile.
	 *
	 * @returns {{ [dir: string]: Tile | null }} An object mapping directions ('n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se')
	 *   to their corresponding neighboring Tile objects. If a neighboring tile 
	 *   does not exist (out of bounds), it returns null for that direction.
	 */
	neighbours() {
		return {
			n: this.map.tileAt(this.x, this.y - 1),
			s: this.map.tileAt(this.x, this.y + 1),
			w: this.map.tileAt(this.x - 1, this.y),
			e: this.map.tileAt(this.x + 1, this.y),
			nw: this.map.tileAt(this.x - 1, this.y - 1),
			ne: this.map.tileAt(this.x + 1, this.y - 1),
			sw: this.map.tileAt(this.x - 1, this.y + 1),
			se: this.map.tileAt(this.x + 1, this.y + 1)
		};
	}

	/**
	 * Returns true if this tile is enclosed by walls in all directions.
	 *
	 * "Enclosed" means that all eight neighboring tiles (horizontally, vertically,
	 * and diagonally adjacent) are either walls that are not part of a corridor,
	 * or do not exist (out of bounds).
	 * 
	 * @returns {boolean} True if this tile is enclosed, false otherwise.
	 */
	isEnclosed() {
		return (
			Object.values(this.neighbours()).filter(
				t => !t || (t.type === TileType.Wall && t.corridor === this.corridor)
			).length === 8
		);
	}

	/**
	 * Calculates the sprite index for this tile based on its raw index.
	 * 
	 * The raw index is the index into the tileset that corresponds to the tile's
	 * appearance. The sprite index is the index into the tileset that is actually
	 * used when rendering the tile. The sprite index may be different from the
	 * raw index if the tile is a wall and it is part of a corridor.
	 * 
	 * @returns {number} The sprite index.
	 */
	spriteIndex() {
		const modifier = this.type === TileType.Wall && this.corridor ? 8 : 0;
		return this.rawIndex() + modifier;
	}

	/**
	 * Returns the raw index of this tile in the tileset.
	 * 
	 * The raw index is the index into the tileset that corresponds to the tile's
	 * appearance. The raw index is used as the base for calculating the sprite
	 * index, which is the index that is actually used when rendering the tile.
	 * 
	 * The raw index calculation is based on the type of the tile and its
	 * neighbours. If the tile is a wall, its raw index is determined by the
	 * number and arrangement of its wall neighbours. If the tile is a door, its
	 * raw index is determined by whether it is vertical or horizontal.
	 * 
	 * @returns {number} The raw index of this tile.
	 */
	rawIndex() {
		const neighbours = this.neighbours();

		const n = neighbours.n && neighbours.n.type === TileType.Wall && neighbours.n.corridor === this.corridor;
		const s = neighbours.s && neighbours.s.type === TileType.Wall && neighbours.s.corridor === this.corridor
		const w = neighbours.w && neighbours.w.type === TileType.Wall && neighbours.w.corridor === this.corridor
		const e = neighbours.e && neighbours.e.type === TileType.Wall && neighbours.e.corridor === this.corridor

		const wDoor = neighbours.w && neighbours.w.type === TileType.Door;
		const eDoor = neighbours.e && neighbours.e.type === TileType.Door;

		const i = Graphics.environment.indices.walls;

		if (this.type === TileType.Wall) {
			if (n && e && s && w) { return i.intersections.n_e_s_w; }
			if (n && e && s) { return i.intersections.n_e_s; }
			if (n && s && w) { return i.intersections.n_s_w; }
			if (e && s && w) { return i.intersections.e_s_w; }
			if (n && e && w) { return i.intersections.n_e_w; }

			if (e && s) { return i.intersections.e_s; }
			if (e && w) { return i.intersections.e_w; }
			if (s && w) { return i.intersections.s_w; }
			if (n && s) { return i.intersections.n_s; }
			if (n && e) { return i.intersections.n_e; }
			if (n && w) { return i.intersections.n_w; }

			if (w && eDoor) { return i.intersections.e_door; }
			if (e && wDoor) { return i.intersections.w_door; }

			if (n) { return i.intersections.n; }
			if (s) { return i.intersections.s; }
			if (e) { return i.intersections.e; }
			if (w) { return i.intersections.w; }

			return i.alone;
		}

		if (this.type === TileType.Door) {
			if (n || s) {
				return Graphics.environment.indices.doors.vertical
			}
			return Graphics.environment.indices.doors.horizontal;
		}

		return 0;
	}
}
