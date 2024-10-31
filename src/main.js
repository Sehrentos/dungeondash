///<reference path="../typings/assets.d.ts" />
import Phaser from "phaser";
import ReferenceScene from "./scenes/ReferenceScene.js";
import DungeonScene from "./scenes/DungeonScene.js";
import InfoScene from "./scenes/InfoScene.js";
// import SceneWatcherPlugin from "phaser-plugin-scene-watcher"; // optional (npm install phaser-plugin-scene-watcher@7.0.0)

new Phaser.Game({
	type: Phaser.WEBGL,
	width: window.innerWidth,
	height: window.innerHeight,
	render: { pixelArt: true },
	physics: { default: "arcade", arcade: { debug: false, gravity: { x: 0, y: 0 } } },
	scene: [DungeonScene, InfoScene, ReferenceScene],
	scale: {
		mode: Phaser.Scale.RESIZE
	},
	// optional
	// plugins: {
	//   global: [{ key: "SceneWatcher", plugin: SceneWatcherPlugin, start: true }]
	// }
});
