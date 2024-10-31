import Dungeoneer from "dungeoneer";
import Tile, { TileType } from "./Tile.js";
import Slime from "./Slime.js";
import Graphics from "../assets/Graphics.js";
import DungeonScene from "../scenes/DungeonScene.js";

/**
 * @class Map
 * @prop {Tile[][]} tiles
 * @prop {number} width
 * @prop {number} height
 * @prop {Phaser.Tilemaps.Tilemap} tilemap
 * @prop {Phaser.Tilemaps.StaticTilemapLayer} wallLayer
 * @prop {Phaser.Tilemaps.DynamicTilemapLayer} doorLayer
 * @prop {number} startingX
 * @prop {number} startingY
 * @prop {Slime[]} slimes
 * @prop {Dungeoneer.Room[]} rooms
 */
export default class Map {
	/**
	 * Constructor for a Map object.
	 * @param {number} width - The width of the map in tiles.
	 * @param {number} height - The height of the map in tiles.
	 * @param {DungeonScene} scene - The scene this map is in.
	 */
	constructor(width, height, scene) {
		const dungeon = Dungeoneer.build({
			width: width,
			height: height
		});
		/** @type {Dungeoneer.Room[]} */
		this.rooms = dungeon.rooms;
		/** @type {number} */
		this.width = width;
		/** @type {number} */
		this.height = height;
		/** @type {Tile[][]} */
		this.tiles = [];
		for (let y = 0; y < height; y++) {
			this.tiles.push([]);
			for (let x = 0; x < width; x++) {
				const tileType = Tile.tileTypeFor(dungeon.tiles[x][y].type);
				this.tiles[y][x] = new Tile(tileType, x, y, this);
			}
		}

		const toReset = [];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tile = this.tiles[y][x];
				if (tile.type === TileType.Wall && tile.isEnclosed()) {
					toReset.push({ y: y, x: x });
				}
			}
		}

		toReset.forEach(d => {
			this.tiles[d.y][d.x] = new Tile(TileType.None, d.x, d.y, this);
		});

		const roomNumber = Math.floor(Math.random() * dungeon.rooms.length);

		const firstRoom = dungeon.rooms[roomNumber];
		/** @type {number} */
		this.startingX = Math.floor(firstRoom.x + firstRoom.width / 2);
		/** @type {number} */
		this.startingY = Math.floor(firstRoom.y + firstRoom.height / 2);
		/** @type {Phaser.Tilemaps.Tilemap} */
		this.tilemap = scene.make.tilemap({
			tileWidth: Graphics.environment.width,
			tileHeight: Graphics.environment.height,
			width: width,
			height: height
		});

		const dungeonTiles = this.tilemap.addTilesetImage(
			Graphics.environment.name,
			Graphics.environment.name,
			Graphics.environment.width,
			Graphics.environment.height,
			Graphics.environment.margin,
			Graphics.environment.spacing
		);

		const groundLayer = this.tilemap
			// .createBlankLayer("Ground", dungeonTiles, 0, 0)
			.createBlankDynamicLayer("Ground", dungeonTiles, 0, 0)
			.randomize(
				0,
				0,
				this.width,
				this.height,
				Graphics.environment.indices.floor.outerCorridor
			);

		/** @type {Slime[]} */
		this.slimes = [];

		for (let room of dungeon.rooms) {
			groundLayer.randomize(
				room.x - 1,
				room.y - 1,
				room.width + 2,
				room.height + 2,
				Graphics.environment.indices.floor.outer
			);

			if (room.height < 4 || room.width < 4) {
				continue;
			}

			const roomTL = this.tilemap.tileToWorldXY(room.x + 1, room.y + 1);
			const roomBounds = this.tilemap.tileToWorldXY(
				room.x + room.width - 1,
				room.y + room.height - 1
			);
			const numSlimes = Phaser.Math.Between(1, 3);
			for (let i = 0; i < numSlimes; i++) {
				this.slimes.push(
					new Slime(
						Phaser.Math.Between(roomTL.x, roomBounds.x),
						Phaser.Math.Between(roomTL.y, roomBounds.y),
						scene
					)
				);
			}
		}
		this.tilemap.convertLayerToStatic(groundLayer).setDepth(1);

		const wallLayer = this.tilemap.createBlankDynamicLayer(
			"Wall",
			dungeonTiles,
			0,
			0
		);
		/** @type {Phaser.Tilemaps.DynamicTilemapLayer} */
		this.doorLayer = this.tilemap.createBlankDynamicLayer(
			"Door",
			dungeonTiles,
			0,
			0
		);

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const tile = this.tiles[y][x];
				if (tile.type === TileType.Wall) {
					wallLayer.putTileAt(tile.spriteIndex(), x, y);
				} else if (tile.type === TileType.Door) {
					this.doorLayer.putTileAt(tile.spriteIndex(), x, y);
				}
			}
		}
		wallLayer.setCollisionBetween(0, 0x7f);
		const collidableDoors = [
			Graphics.environment.indices.doors.horizontal,
			Graphics.environment.indices.doors.vertical
		];
		this.doorLayer.setCollision(collidableDoors);

		this.doorLayer.setTileIndexCallback(
			collidableDoors,
			/**
			 * @param {*} _ 
			 * @param {Phaser.Tilemaps.Tile} tile 
			 */
			(_, tile) => {
				this.doorLayer.putTileAt(
					Graphics.environment.indices.doors.destroyed,
					tile.x,
					tile.y
				);
				this.tileAt(tile.x, tile.y)?.open();
				scene.fov?.recalculate();
			},
			this
		);
		this.doorLayer.setDepth(3);

		/** @type {Phaser.Tilemaps.StaticTilemapLayer} */
		this.wallLayer = this.tilemap.convertLayerToStatic(wallLayer);
		this.wallLayer.setDepth(2);
	}

	/**
	 * Gets the tile at the specified coordinates.
	 * @param {number} x - X coordinate.
	 * @param {number} y - Y coordinate.
	 * @returns {Tile | null} The tile at the given coordinates, or null if out of bounds.
	 */
	tileAt(x, y) {
		if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
			return null;
		}
		return this.tiles[y][x];
	}

	/**
	 * Returns true if the specified coordinates are within any room.
	 * @param {number} x - X coordinate.
	 * @param {number} y - Y coordinate.
	 * @returns {boolean} True if the coordinates are within any room.
	 */
	withinRoom(x, y) {
		return (
			this.rooms.find(r => {
				const { top, left, right, bottom } = r.getBoundingBox();
				return (
					y >= top - 1 && y <= bottom + 1 && x >= left - 1 && x <= right + 1
				);
			}) != undefined
		);
	}
}
