# Dungeon Dash!

Forked from the original [dungeondash](https://github.com/mipearson/dungeondash).

An experiment with making a dungeon crawler with Open Source or public domain assets, using Phaser 3.

## Installation

Install require NodeJS dependencies.
```sh
npm install
```

## Build & run

Console command
```sh
npm run build
npm run start
```

## Development

Open 2 terminals:
1. serve web assets
```sh
npm run start
```
2. watch file changes and rebuild the client app
```sh
npm run watch
```

## Game play

Press `R` in game to see a tilesheet reference, press `R` again to return to the game. Press `Q` to show the debug layer.

## TODO

 * use `PerformanceObserver` to get a more accurate FPS value
 * upgrade Phaser version
 * fix Fonts XML loading
 * better audio files

## Credits

* Michael Pearson & Others. The original [dungeondash](https://github.com/mipearson/dungeondash) repo
* Uses [mrpas](https://www.npmjs.com/package/mrpas) to determine the field of view
* Uses [dungeoneer](https://www.npmjs.com/package/dungeoneer) to generate the dungeon
* `Rogue*.png` files are from the [Rogue Dungeon Tileset 16x16](https://fongoose.itch.io/rogue-dungeon-tileset-16x16) by [fongoose](https://twitter.com/fongoosemike)
* "CasualEncounter" font from Anna Anthropy's [World of Fonts](https://w.itch.io/world-of-fonts)
