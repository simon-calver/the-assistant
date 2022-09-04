import MenuScene from './menu-scene.js';
import PlayerScene from './player-scene.js';
import PromisesScene from './promises-scene.js';

// Load scenes
var menuScene = new MenuScene();
var playerScene = new PlayerScene();
var promisesScene = new PromisesScene();

// Maximum width and height of game
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const MIN_WIDTH = 36;
const MIN_HEIGHT = 72;

// Set up Phaser game
var game = new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: "dedede",
  dom: {
    createContainer: true
  },
  callbacks: {
    postBoot: function (game) {
      game.domContainer.style.pointerEvents = 'none';
    },
  },
  width: WIDTH,
  height: HEIGHT,
  scale: {
    parent: 'phaser-app',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    min: {
      width: MIN_WIDTH,
      height: MIN_HEIGHT
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      enableBody: true,
      debug: true,
    }
  },
});

// Load scenes, the order they are loaded in will affect depth sorting
game.scene.add('PromisesScene', promisesScene);
game.scene.add('PlayerScene', playerScene);
game.scene.add('MenuScene', menuScene);

// Start the game
game.scene.start('PlayerScene', { 'scene': 'PromisesScene', 'title': 'In-Flight Movie \nThe Assistant' });
