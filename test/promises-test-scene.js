const SHAPE_COLOURS_HEX = [0x5f6ee5, 0xe5557d, 0xffffff, 0xf4da76];

import { MysteriousShapeFull, MysteriousShapeHollow, TutorialShape } from '../js/shapes.js';
import { SpikeShape, Sucker, BonusBall } from '../js/extra-shapes.js';
import { ShapeContainer } from '../js/shape-container.js';

export default class PromisesScene extends Phaser.Scene {

  constructor() {
    super('PromisesScene');
  }

  preload() {
    // Backgrounds
    this.load.image('background', 'assets/images/backgrounds/background.png');
    this.load.image('light', 'assets/images/backgrounds/light.png');

    // Plugins
    this.load.plugin('rexswirlpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexswirlpipelineplugin.min.js', true);

    // Audio
    this.load.audio('promises', 'assets/audio/promises.mp3', { stream: true }); // What does stream do??????

    // For testing that the loading screen works
    // for (var i = 0; i < 50; i++) {
    //   this.load.image(`light_${i}`, 'assets/images/backgrounds/light.png');
    // }

    // Game assets
    this.load.image('black-hole', 'assets/sprites/black-hole.png');
    this.load.image('ball', 'assets/sprites/ball.png');
    this.load.atlas('star', 'assets/sprites/star.png', 'assets/sprites/star.json');
  }

  create(params = { 'pauseAtStart': true, 'muteSong': false, 'firstGame': false }) {
    // I don't want the canvas to fill the screen on desktop, so set default size. This should only affect the 
    // aspect ratio since it is using scale.FIT
    if (this.sys.game.device.os.desktop) {
      this.scale.setGameSize(380, 720);
    }
    // get this after resizing, obviously
    let { width, height } = this.sys.game.canvas;
    this.origin = new Phaser.Math.Vector2(width / 2, height / 2 - 50);

    this.sinks = []; //this.origin];
    // this.target = this.origin;
    // this.speedToTarget = -1; // Initially things move away from target

    this.setUpShapes();
    this.setUpDrag();

    // if (params['firstGame']) {
    //   // spawn specil shape
    //   this.spawnTutorialShapes();
    // }
    this.initialSpawn();

    this.addBackground();

    // Store each score and time it was added in separate arrays, is this the best way to find 
    // score at a specific time? Also have a score that is not time dependent
    this.scores = [0];
    this.scoreTimes = [0];
    this.fixedScore = 0;

    this.playerScene = this.scene.get('PlayerScene');

    // How make song not play a little if pause at start?
    this.song = this.sound.add('promises');
    this.song.on('complete', function () {
      this.playerScene.endGame();
    }, this);

    this.song.play();
    if (params['muteSong']) {
      this.song.setVolume(0);
      this.updateGameScore(-20, 2, false);
    }

    // Spawn the shapes!
    this.spawnAngle = 0;
    this.spawnIndex = 0;
    this.spawnTimer = this.time.addEvent({
      delay: 1678,
      loop: true,
      callback: this.spawnShape,
      callbackScope: this
    }, this);

    this.collisionHappening = false;
  }

  setUpShapes() {
    this.anims.create({
      key: 'pulse',
      frames: this.anims.generateFrameNames('star', { prefix: 'star_', end: 3, zeroPad: 0 }),
      frameRate: 4,
      repeat: -1,
      yoyo: true,
    });

    this.shapes = this.add.group();
    this.shapes.add(this.physics.add.group({ classType: MysteriousShapeFull, runChildUpdate: true }));
    this.shapes.add(this.physics.add.group({ classType: MysteriousShapeHollow, runChildUpdate: true }));

    // this.extraShapes = this.add.group();
    // this.extraShapes.add(this.physics.add.group({ classType: SpikeShape, runChildUpdate: true, maxSize: 14 }));
    // this.extraShapes.add(this.physics.add.group({ classType: Sucker, runChildUpdate: true, maxSize: 2 }));

    // this.physics.add.overlap(this.shapes, this.extraShapes, function (shape, extraShape) {
    //   shape.parent.destroyShapes([shape], extraShape.getCenter());
    // }.bind(this));

    this.spikeShapes = this.physics.add.group({ classType: SpikeShape, runChildUpdate: true, maxSize: 14 });
    this.suckerShapes = this.physics.add.group({ classType: Sucker, runChildUpdate: true, maxSize: 2 });
    this.bonusBalls = this.physics.add.group({ classType: BonusBall, runChildUpdate: true, maxSize: 1 });

    this.physics.add.overlap(this.shapes, this.spikeShapes, function (shape, spikeShape) {
      if (shape.id == spikeShape.id) {
        shape.parent.destroyShapes([shape]);
      }
    }.bind(this));
    this.physics.add.overlap(this.shapes, this.suckerShapes, function (shape, suckerShape) {
      shape.parent.destroyShapes([shape], suckerShape.getCenter());
    }.bind(this));
    this.physics.add.overlap(this.shapes, this.bonusBalls, function (shape, bonusBall) {
      bonusBall.destroy();
      for (var shapeContainer of this.shapeContainers) {
        shapeContainer.checkClusters(1, bonusBall.id);
      }
      // shape.parent.destroyShapes([shape], suckerShape.getCenter());
    }.bind(this));

    this.physics.add.overlap(this.shapes, this.shapes, function (shape1, shape2) {
      // console.log('shape colliding', shape1.isColliding);
      // if (!this.collisionHappening) {
      // this.collisionHappening = true;
      // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaa")
      shape1.updateCollision();
      shape2.updateCollision();
      this.mergeShapes(shape1, shape2);
      //   shape1.isColliding = false;
      //   shape2.isColliding = false;
      // }
      // console.log('shpes after merge', shape1);
      // console.log('shpes after merge', shape2);

      // this.collisionHappening = false;
    }.bind(this));

    ///////////////////////////////////////////
    // Use var bounds1 = shape1.getBounds(); then modify bounds to be shape of collider, i.e. width,height=95%
    // then use Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2) to compare colliding object with
    // all shapes in the moving container and check for overlaps, keep doing moveContainer while this is true
    ///////////////////////////////////////////

    this.shapeContainers = [];

    // Can I do this with fewer variables?
    this.spikesSpawned1 = false;
    this.spikesSpawned2 = false;
    this.spikesSpawned3 = false;
    this.bonusBallSpawned = false;
    this.blackHoleSpawned = false;
  }

  setUpDrag() {
    // Use this to approximate drag velocity
    let previousDragX = 0;
    let previousDragY = 0;

    this.dragVelocity = new Phaser.Math.Vector2();

    this.canDrag = true;
    this.input.on('dragstart', function (pointer, obj) {
      this.canDrag = true; //  A bit of a crappy way of stopping during drag etc
      obj.parent.pauseUpdate();
      obj.parent.updateSeparations(obj);
      obj.parent.moveToTop();
      this.draggedShape = obj;
    }, this);
    this.input.on('drag', function (pointer, obj, dragX, dragY) {
      if (this.canDrag) {
        this.dragVelocity.x = dragX - previousDragX;
        this.dragVelocity.y = dragY - previousDragY;

        previousDragX = dragX;
        previousDragY = dragY;
        obj.parent.container.iterate(function (shape) {
          shape.setPosition(dragX + shape.separation.x, dragY + shape.separation.y);
        });
      }
    }, this);
    this.input.on('dragend', function (pointer, obj) {
      obj.parent.unpauseUpdate();
      obj.parent.calculateDirection();
      // obj.parent.moveFromTop();
    }, this);
  }

  addBackground() {
    this.background = new Background(this);
  }

  setSongPercent(percent) {
    // Update scores to previous values, do nothing if time shifted forwards 
    const songTime = this.percentToSeconds(percent);
    if (songTime < this.song.seek) {
      this.revertScores(songTime);
    }
    // Dissolve all shapes now, to not give advantage?

    // Maybe don't hard code these values, they shouldn't change though    
    if (songTime < 59) {
      this.blackHoleSpawned = false;
      this.bonusBallSpawned = false;
      this.spikesSpawned1 = false;
      this.spikesSpawned2 = false;
      this.spikesSpawned3 = false;
    } else if (songTime < 100) {
      this.blackHoleSpawned = false;
      this.bonusBallSpawned = false;
      this.spikesSpawned2 = false;
      this.spikesSpawned3 = false;
    } else if (songTime < 113) {
      this.blackHoleSpawned = false;
      this.bonusBallSpawned = false;
      this.spikesSpawned3 = false;
    } else if (songTime < 153) {
      this.bonusBallSpawned = false;
      this.spikesSpawned3 = false;
    } else if (songTime < 176) {
      this.spikesSpawned3 = false;
    }

    this.song.seek = songTime;
  }

  revertScores(songTime) {
    const index = this.scoreTimes.findIndex(n => n > songTime);
    // An index of -1 means there are no values after this time so don't modify the array
    if (index >= 0) {
      // Ignore last elements after songTime by setting length of array, should be fastest?
      this.scores.length = index;
      this.scoreTimes.length = index;

      let playerScene = this.scene.get('PlayerScene');
      playerScene.updateScoreText(this.scores[this.scores.length - 1] + this.fixedScore);
      // Make sure the arrays are not being updated when you do this??
    }
  }

  percentToSeconds(percent) {
    return percent * this.song.totalDuration
  }

  getSongPercent() {
    return this.song.seek / this.song.totalDuration;
  }

  mergeShapes(shape1, shape2) {
    // Check that not in the same container and can collide before doing anything
    console.log(!shape1.parent.container.exists(shape2))
    if (!shape1.parent.container.exists(shape2) && shape1.canCollide && shape2.canCollide) { //} && !shape1.isColliding && !shape2.isColliding) {
      console.log("MERGE SHAPES")
      // shape1.isColliding = true;
      // shape2.isColliding = true;
      if (shape1.parent.container.exists(this.draggedShape)) {
        this.moveContainer(shape1, shape2);
        shape1.parent.merge(shape1, shape2);
        shape1.parent.mergeEffect(shape1, shape2);
      } else {
        this.moveContainer(shape2, shape1);
        shape2.parent.merge(shape2, shape1);
        shape2.parent.mergeEffect(shape2, shape1);
      }
      // console.log(' shape after merge', shape1);
      // console.log(' shape after merge', shape2);
      // shape1.isColliding = false;
      // shape2.isColliding = false;


    }
  }

  moveContainer(moveShape, collideShape) {
    // Make sure the two colliding shapes don't overlap by moving one of the containers
    let moveShapeWorldPos = moveShape.getWorldPos();
    let collideShapeWorldPos = collideShape.getWorldPos();

    let xOffset = 0;
    let yOffset = 0;

    if (this.dragVelocity.x > 0) {
      xOffset = (moveShapeWorldPos.x + moveShapeWorldPos.width / 2) - (collideShapeWorldPos.x - collideShapeWorldPos.width / 2);
    } else {
      xOffset = (moveShapeWorldPos.x - moveShapeWorldPos.width / 2) - (collideShapeWorldPos.x + collideShapeWorldPos.width / 2);
    }

    if (this.dragVelocity.y > 0) {
      yOffset = (moveShapeWorldPos.y + moveShapeWorldPos.height / 2) - (collideShapeWorldPos.y - collideShapeWorldPos.height / 2);
    } else {
      yOffset = (moveShapeWorldPos.y - moveShapeWorldPos.height / 2) - (collideShapeWorldPos.y + collideShapeWorldPos.height / 2);
    }

    if (Math.abs(xOffset) < Math.abs(yOffset)) {
      collideShape.parent.container.x += xOffset;
    } else {
      collideShape.parent.container.y += yOffset;
    }

    // Do soething if this move puts this shape inside another
    // if (collideShape.touching) {
    //   this.moveContainer(moveShape, collideShape);
    // }
  }

  pauseGame() {
    this.song.pause();
  }

  resumeGame() {
    this.song.resume();
  }

  spawnBlackHole() {
    let { width, height } = this.sys.game.canvas;
    this.suckerShapes.get(width + 40, this.origin.y + Phaser.Math.FloatBetween(-height / 3, height / 3));
  }

  spawnSpikeShapes(num) {
    let { width, height } = this.sys.game.canvas;

    this.background.setLightTint();

    for (var i = 0; i < num; i++) {
      let id = Phaser.Math.Between(0, 3);
      let dir = new Phaser.Math.Vector2(-1, Phaser.Math.FloatBetween(-0.25, 0.25));
      this.spikeShapes.get(width + Phaser.Math.FloatBetween(20, 60), (i + Phaser.Math.FloatBetween(0.05, 0.95)) * height / 3, id, dir.normalize());
    }
    for (var i = 0; i < num; i++) {
      let id = Phaser.Math.Between(0, 3);
      let dir = new Phaser.Math.Vector2(1, Phaser.Math.FloatBetween(-0.25, 0.25));
      this.spikeShapes.get(-Phaser.Math.FloatBetween(20, 60), (i + Phaser.Math.FloatBetween(0.05, 0.95)) * height / 3, id, dir.normalize());
    }
  }

  spawnBonusBall() {
    let { width, height } = this.sys.game.canvas;
    let id = Phaser.Math.Between(0, 3);
    this.bonusBalls.get(this.origin.x + Phaser.Math.FloatBetween(-width / 4, width / 4), -20, id);
  }

  spawnShape() {
    let direction = new Phaser.Math.Vector2();
    const angle = this.spawnIndex * Phaser.Math.PI2 / 4 + Phaser.Math.FloatBetween(-0.4, 0.4);
    direction.setToPolar(angle, 4);

    this.spawnAngle += Phaser.Math.PI2 / 2 + Phaser.Math.PI2 / 4 + Phaser.Math.FloatBetween(-0.4, 0.4);
    direction.setToPolar(this.spawnAngle, 4);
    this.spawn(this.origin.x + direction.x, this.origin.y + direction.y, true);

    this.spawnIndex = (this.spawnIndex + 1) % 4;
  }

  initialSpawn() {
    let shapeGroup = this.shapes.getChildren()[0];
    let shape;
    let previousShape;
    let container;

    shape = shapeGroup.get(1, false);
    let bigContainer = new ShapeContainer(this, this.origin.x, this.origin.y, 0.2, shape, 0);

    // this.shapeContainers.push(bigContainer);
    // for (var i = 0; i < 50; i++) {
    //   previousShape = shape;
    //   shape = shapeGroup.get(1, false);
    //   let newContainer = new ShapeContainer(this, this.origin.x + 10, this.origin.y, 0.2, shape, 0);
    //   this.shapeContainers.push(newContainer);
    //   bigContainer.merge(shape, previousShape);  //addShape(shape);
    // }
    // let shape = shapeGroup.get(1, false); //new ShapeContainer(this, this.origin.x + 10, this.origin.y - 50, 0.2, shape, 0));

    shape = shapeGroup.get(1, false);
    container = new ShapeContainer(this, this.origin.x + 80, this.origin.y, 0.2, shape, 0)
    this.shapeContainers.push(container);
    container.setDirection(new Phaser.Math.Vector2(-1, 0))

    shape = shapeGroup.get(2, false);
    container = new ShapeContainer(this, this.origin.x - 80, this.origin.y, 0.2, shape, 0)
    this.shapeContainers.push(container);
    container.setDirection(new Phaser.Math.Vector2(1, 0))

    shape = shapeGroup.get(2, false);
    container = new ShapeContainer(this, this.origin.x - 80, this.origin.y + 80, 0.2, shape, 0)
    this.shapeContainers.push(container);
    container.setDirection(new Phaser.Math.Vector2(1, -1))

    shape = shapeGroup.get(1, false);
    container = new ShapeContainer(this, this.origin.x - 80, this.origin.y - 80, 0.2, shape, 0)
    this.shapeContainers.push(container);
    container.setDirection(new Phaser.Math.Vector2(1, 1))

    shape = shapeGroup.get(2, false);
    container = new ShapeContainer(this, this.origin.x - 140, this.origin.y, 0.2, shape, 0)
    this.shapeContainers.push(container);
    container.setDirection(new Phaser.Math.Vector2(1, 0))

    // this.spawn(this.origin.x + 100, this.origin.y - 100);
    // this.spawn(this.origin.x + 120, this.origin.y + 100);
    // this.spawn(this.origin.x - 190, this.origin.y + 100);
    // this.spawn(this.origin.x - 160, this.origin.y - 180);
    // this.spawn(this.origin.x + 50, this.origin.y + 80);
    // this.spawn(this.origin.x - 16, this.origin.y - 280);
    // this.spawn(this.origin.x + 50, this.origin.y - 80);
    // this.spawn(this.origin.x - 80, this.origin.y - 20);

  }

  spawnTutorialShapes() {

    // let tutorialShapes = this.physics.add.group({ classType: TutorialShape, runChildUpdate: true });

    // this.physics.add.overlap(tutorialShapes, this.extraShapes, function (shape, extraShape) {
    //   shape.parent.destroyShapes([shape]);
    // }.bind(this));

    // this.physics.add.overlap(tutorialShapes, this.shapes, function (shape1, shape2) {
    //   // console.log("AAAAAAAA")
    //   shape1.updateCollision();
    //   shape2.updateCollision();
    //   this.mergeShapes(shape1, shape2);
    // }.bind(this));


    // this.shapes = this.add.group();
    // this.shapes.add(this.physics.add.group({ classType: MysteriousShapeFull, runChildUpdate: true }));
    // this.shapes.add(this.physics.add.group({ classType: MysteriousShapeHollow, runChildUpdate: true }));

    // this.extraShapes = this.add.group();
    // this.extraShapes.add(this.physics.add.group({ classType: SpikeShape, runChildUpdate: true, maxSize: 14 }));
    // this.extraShapes.add(this.physics.add.group({ classType: Sucker, runChildUpdate: true, maxSize: 2 }));

    // this.physics.add.overlap(this.shapes, this.extraShapes, function (shape, extraShape) {
    //   shape.parent.destroyShapes([shape]);
    // }.bind(this));

    // this.physics.add.overlap(this.shapes, this.shapes, function (shape1, shape2) {
    //   shape1.updateCollision();
    //   shape2.updateCollision();
    //   this.mergeShapes(shape1, shape2);
    // }.bind(this));

    this.shapes.add(this.physics.add.group({ classType: TutorialShape, runChildUpdate: true }));
    let shape = this.shapes.getChildren()[2].get(0);   //tutorialShapes.get(0);//this.shapes.getChildren()[0].get(0);//;   tutorialShapes.get(0);

    let tutorialContainer = new ShapeContainer(this, this.origin.x - 70, this.origin.y + 200, 0.19, shape);
    tutorialContainer.setSpeed(0);

    // pauseUpdate();
    this.shapeContainers.push(tutorialContainer);
  }

  spawn(x, y, fadeIn = false) {
    let id = Phaser.Math.Between(0, 3);
    let scale = Phaser.Math.FloatBetween(0.16, 0.2);

    // Choose a shape type at random with unequal probabilities
    let prob = Phaser.Math.FloatBetween(0, 1);
    let shapeGroup;
    if (prob > 0.15) {
      shapeGroup = this.shapes.getChildren()[0];
    } else {
      shapeGroup = this.shapes.getChildren()[1];
    }
    let shape = shapeGroup.get(id, fadeIn);

    this.shapeContainers.push(new ShapeContainer(this, x, y, scale, shape, this.spawnIndex));
  }

  update(time, delta) {
    this.playerScene.updatePlayTime(this.song.seek, this.getSongPercent());

    for (var shapeContainer of this.shapeContainers) {
      shapeContainer.update();
    }

    // Can these bits be done better? Emit event?
    ////////////////////////////////////////////////////////////////////////////////////
    if (this.song.seek > 54 & this.song.seek < 59 & !this.spikesSpawned1) { // 54-68
      this.spikesSpawned1 = true;
      this.spawnSpikeShapes(2);
    } else if (this.song.seek > 95 & this.song.seek < 100 & !this.spikesSpawned2) { // 95-108
      this.spikesSpawned2 = true;
      this.spawnSpikeShapes(3);
    } else if (this.song.seek > 108 & this.song.seek < 113 & !this.blackHoleSpawned) { // 108-142
      this.blackHoleSpawned = true;
      this.spawnBlackHole();
    } else if (this.song.seek > 148 & this.song.seek < 153 & !this.bonusBallSpawned) { // 
      this.bonusBallSpawned = true;
      // this.spawnBonusBall();
    } else if (this.song.seek > 171 & this.song.seek < 176 & !this.spikesSpawned3) { // 171-184
      this.spikesSpawned3 = true;
      this.spawnSpikeShapes(4);
    }
    ///////////////////////////////////////////////////////////////////////////////////
  }

  updateGameScore(score, id, timeDependent = true) {
    const currentScore = this.getTotalScore();
    const newScore = currentScore + score;

    if (timeDependent) {
      // Don't add time independent scores to this array
      this.scores.push(this.scores[this.scores.length - 1] + score);
      this.scoreTimes.push(this.song.seek);
    } else {
      this.fixedScore += score
    }

    let playerScene = this.scene.get('PlayerScene');
    playerScene.updateGameScore(currentScore, newScore, SHAPE_COLOURS_HEX[id])
  }

  getTotalScore() {
    return this.scores[this.scores.length - 1] + this.fixedScore;
  }
}

class Background {
  constructor(scene) {
    this.scene = scene;

    scene.add.image(scene.origin.x, scene.origin.y, 'background').setOrigin(0.5);
    this.light = scene.add.image(scene.origin.x, scene.origin.y, 'light');
  }

  setLightTint() {
    const orig = [255, 255, 255]
    const tint = [175, 11, 19];
    const originalTint = Phaser.Display.Color.ValueToColor(0xffffff);
    const newTint = Phaser.Display.Color.ValueToColor(0x000000); //0xaf0b13);

    this.scene.tweens.addCounter({
      from: 0,
      to: 180,
      duration: 6500,
      yoyo: true,
      onUpdate: function (tween) {
        const value = tween.getValue();
        // Do this so it stays the same colour for half of the tween
        if (value <= 100) {
          const colourObject = Phaser.Display.Color.Interpolate.ColorWithColor(originalTint, newTint, 100, value);
          this.light.setTint(Phaser.Display.Color.GetColor(colourObject.r, colourObject.g, colourObject.b));
        }
      }.bind(this),
    });
  }

  update(time, delta) {

  }
}
