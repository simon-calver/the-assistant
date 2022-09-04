const SHAPE_COLOURS_HEX = [0x5f6ee5, 0xe5557d, 0xffffff, 0xf4da76];
const SHAPE_COLOURS_HEX_DARK = [0x313977, 0x772c41, 0x848484, 0x7e713d];

class MysteriousShape extends Phaser.GameObjects.Polygon {
  constructor(scene, points, id, fadeIn) {
    // TODO: Set depth of main shape 
    super(scene, 0, 0, points, SHAPE_COLOURS_HEX[id], 1.0).setInteractive().setOrigin(0.5).setScale(0.01); //.setAlpha(0)
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.width * 0.98, this.height * 0.98);

    this.scene = scene;
    this.id = id;
    this.setColourIds(id);

    let shapeDepth = Phaser.Math.RND.between(5, 15);
    this.shapeDepth = 0;

    // Graphics for edges of the shape (not interactive) 
    this.mainEdgeGraphics = scene.add.graphics();
    this.vertEdgeGraphics = scene.add.graphics();
    this.horizEdgeGraphics = scene.add.graphics();

    this.mainEdgeGraphics.lineStyle(4, 0x000000, 0.0).setDepth(95);
    this.vertEdgeGraphics.fillStyle(0x000000, 0.0);
    this.horizEdgeGraphics.fillStyle(0x000000, 0.0);

    this.separation = new Phaser.Math.Vector2(0, 0);

    this.setDraggable();
    this.inContainer = false;

    this.canCollide = false;
    this.isSpawning = true;

    if (fadeIn) {
      scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 900,
        onUpdate: function (tween) {
          const value = tween.getValue();
          this.fadeIn(this, value, shapeDepth);
        }.bind(this),
        onComplete: function () {
          this.isSpawning = false;
        }.bind(this)
      });
    } else {
      this.isSpawning = false;
      this.shapeDepth = shapeDepth;
      this.setScale(1);
    }

    this.lastCollisionTime = 0;

    this.beingRemoved = false;
  }

  setColourIds(id) {
    // Choose random colours for edge that are not the colour of the face
    let colourIds = [0, 1, 2, 3];
    colourIds.splice(id, 1); // The value and index are the same, so just remove by id
    this.vertEdgeId = Phaser.Math.RND.pick(colourIds);
    const index = colourIds.indexOf(this.vertEdgeId); // This time you need to find the index as the length has changed
    colourIds.splice(index, 1);
    this.horizEdgeId = Phaser.Math.RND.pick(colourIds);
  }

  fadeIn(image, tweenValue, shapeDepth) {
    image.setScale(tweenValue);
    this.shapeDepth = tweenValue * shapeDepth;
  }

  setDraggable() {
    this.scene.input.setDraggable(this);
  }

  setParent(parent) {
    this.inContainer = true;
    this.parent = parent;
  }

  changeId(newId) {
    const originalColour = Phaser.Display.Color.ValueToColor(SHAPE_COLOURS_HEX[this.id]);
    const newColour = Phaser.Display.Color.ValueToColor(SHAPE_COLOURS_HEX[newId]);

    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 400,
      onUpdate: function (tween) {
        const value = tween.getValue();
        const colourObject = Phaser.Display.Color.Interpolate.ColorWithColor(originalColour, newColour, 100, value);
        this.setFillStyle(Phaser.Display.Color.GetColor(colourObject.r, colourObject.g, colourObject.b));
      }.bind(this),
      onComplete: function () {
        this.id = newId;
        this.parent.checkClusters();
      }.bind(this),
    });
  }

  update(time, delta) {
    this.addEdges();

    if (time - this.lastCollisionTime > 250 && !this.canCollide && !this.isSpawning) {//} this.alpha == 1.0) {
      this.canCollide = true;
    }
  }

  updateCollision() {
    if (!this.beingRemoved) {
      this.lastCollisionTime = this.scene.time.now;
    }
  }

  updateDepth(shapeDepth, mainDepth) {
    this.setDepth(shapeDepth);
    this.mainEdgeGraphics.setDepth(mainDepth - 1);
  }

  clearGraphics() {
    this.mainEdgeGraphics.clear();
    this.vertEdgeGraphics.clear();
    this.horizEdgeGraphics.clear();
  }

  getWorldPos() {
    if (this.inContainer) {
      let worldX = this.parent.container.scaleX * this.x + this.parent.container.x;
      let worldY = this.parent.container.scaleX * this.y + this.parent.container.y;
      let worldWidth = this.parent.container.scaleX * this.displayWidth;
      let worldHeight = this.parent.container.scaleX * this.displayHeight;
      return { x: worldX, y: worldY, width: worldWidth, height: worldHeight };
    } else {
      return { x: this.x, y: this.y, width: this.displayWidth, height: this.displayHeight };
    }
  }

  getWorldScale() {
    if (this.inContainer) {
      return this.scaleX * this.parent.container.scaleX;
    } else {
      return this.scaleX;
    }
  }

  vertEdgePoints(x, yTop, yBottom) {
    let angleTop = Math.atan2(x - this.scene.origin.x, yTop - this.scene.origin.y);
    let angleBottom = Math.atan2(x - this.scene.origin.x, yBottom - this.scene.origin.y);
    return [
      x, yBottom,
      x, yTop,
      x - this.shapeDepth * Math.sin(angleTop), yTop - this.shapeDepth * Math.cos(angleTop),
      x - this.shapeDepth * Math.sin(angleBottom), yBottom - this.shapeDepth * Math.cos(angleBottom)
    ]
  }

  horizEdgePoints(y, xLeft, xRight) {
    let angleLeft = Math.atan2(xLeft - this.scene.origin.x, y - this.scene.origin.y);
    let angleRight = Math.atan2(xRight - this.scene.origin.x, y - this.scene.origin.y);
    return [
      xRight, y,
      xLeft, y,
      xLeft - this.shapeDepth * Math.sin(angleLeft), y - this.shapeDepth * Math.cos(angleLeft),
      xRight - this.shapeDepth * Math.sin(angleRight), y - this.shapeDepth * Math.cos(angleRight)
    ]
  }

  setPoints(obj, objGraphics, points) {
    obj.setTo(points);
    objGraphics.fillPoints(obj.points, true);
    objGraphics.strokePoints(obj.points, true);
  }

  score() {
    let shapeScore = Math.ceil(Math.sqrt(this.getArea()) / 50);
    let { x, y, width, height } = this.getWorldPos();

    const frames = ['blue', 'red', 'white', 'yellow'];

    let playerScene = this.scene.scene.get('PlayerScene');
    let gameCanvas = this.scene.sys.game.canvas;
    let emitter = playerScene.particleEmitter(
      'particles',
      {
        frame: frames[this.id],
        moveToX: gameCanvas.width - 20 - playerScene.scoreText.width / 2,
        moveToY: 20,
        angle: { start: 0, end: 360, steps: 32 },
        quantity: 10,
        speed: { min: 60, max: 100 },
        scale: { start: 0.4, end: 0.1 },
        lifespan: 600,
        // blendMode: 'ADD',
        on: false
      }
    );
    emitter.emitParticleAt(x, y);

    return shapeScore;
  }

  remove(target) {
    // Avoid trying to remove this if it is already being removed!
    if (!this.beingRemoved) {
      this.beingRemoved = true;

      this.body.setEnable(false);
      this.disableInteractive();

      this.inContainer = false;

      const shapeScale = this.getWorldScale();
      var particles = this.scene.add.particles('particles');
      if (target) {
        let emitter = particles.createEmitter({
          frame: ['squares_0', 'squares_1', 'squares_2', 'squares_3', 'squares_4', 'squares_5'],
          moveToX: target.x,
          moveToY: target.y,
          angle: { min: 0, max: 360 },
          quantity: 4,
          speed: { min: 60, max: 180 },
          scale: { start: 4 * shapeScale, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 600,
          // blendMode: 'ADD',
          on: false
        });
        emitter.setTint(SHAPE_COLOURS_HEX[this.id]);
        emitter.emitParticleAt(this.x, this.y);
      } else {
        let emitter = particles.createEmitter({
          frame: ['squares_0', 'squares_1', 'squares_2', 'squares_3', 'squares_4', 'squares_5'],
          angle: { min: 0, max: 360 },
          speed: { min: 60, max: 180 },
          lifespan: 900,
          alpha: { start: 1, end: 0 },
          scale: { start: 4 * shapeScale, end: 0.5 * shapeScale },
          on: false
        });
        emitter.setTint(SHAPE_COLOURS_HEX[this.id]);
        emitter.explode(4, this.x, this.y);
      }

      this.clearGraphics();
      this.destroy();
    }
  }
}

class MysteriousShapeHollow extends MysteriousShape {
  constructor(scene, id, fadeIn) {
    let rectWidth = Phaser.Math.RND.between(180, 260);
    let rectHeight = Phaser.Math.RND.between(180, 260);

    let rectInnerWidthPercent = Phaser.Math.FloatBetween(0.4, 0.6);
    let rectInnerHeightPercent = Phaser.Math.FloatBetween(0.4, 0.6);

    let rectInnerWidth = rectInnerWidthPercent * rectWidth;
    let rectInnerHeight = rectInnerHeightPercent * rectHeight;

    let points = [
      0, rectHeight,
      rectWidth, rectHeight,
      rectWidth, 0,
      0, 0,
      0, rectHeight,
      (rectWidth - rectInnerWidth) / 2, (rectHeight - rectInnerHeight) / 2,
      rectInnerWidth + (rectWidth - rectInnerWidth) / 2, (rectHeight - rectInnerHeight) / 2,
      rectInnerWidth + (rectWidth - rectInnerWidth) / 2, rectInnerHeight + (rectHeight - rectInnerHeight) / 2,
      (rectWidth - rectInnerWidth) / 2, rectInnerHeight + (rectHeight - rectInnerHeight) / 2,
      (rectWidth - rectInnerWidth) / 2, (rectHeight - rectInnerHeight) / 2,
    ]
    super(scene, points, id, fadeIn);

    this.mainEdgeOuter = new Phaser.Geom.Polygon([]);
    this.mainEdgeInner = new Phaser.Geom.Polygon([]);
    this.vertEdgeOuter = new Phaser.Geom.Polygon([]);
    this.vertEdgeInner = new Phaser.Geom.Polygon([]);
    this.horizEdgeOuter = new Phaser.Geom.Polygon([]);
    this.horizEdgeInner = new Phaser.Geom.Polygon([]);

    this.rectInnerWidthPercent = rectInnerWidthPercent;
    this.rectInnerHeightPercent = rectInnerHeightPercent;
  }

  addEdges() {
    this.clearGraphics();
    let { x, y, width, height } = this.getWorldPos();

    // Set the properties before drawing the lines or it won't work
    this.mainEdgeGraphics.lineStyle(4, 0x000000, this.alpha);

    this.vertEdgeGraphics.fillStyle(SHAPE_COLOURS_HEX_DARK[this.vertEdgeId], this.alpha);
    this.vertEdgeGraphics.lineStyle(2, 0x000000, this.alpha);

    this.horizEdgeGraphics.fillStyle(SHAPE_COLOURS_HEX_DARK[this.horizEdgeId], this.alpha);
    this.horizEdgeGraphics.lineStyle(2, 0x000000, this.alpha);

    let pointsOuter;
    let pointsInner;

    // Make slightly wider to account for the thickness of the edge line 
    let xLeftOuter = x - width / 2 - 1;
    let xLeftInner = x - this.rectInnerWidthPercent * width / 2 - 1;
    let xRightOuter = x + width / 2 + 1;
    let xRightInner = x + this.rectInnerWidthPercent * width / 2 + 1;
    let yTopOuter = y - height / 2 - 1;
    let yTopInner = y - this.rectInnerHeightPercent * height / 2 - 1;
    let yBottomOuter = y + height / 2 + 1;
    let yBottomInner = y + this.rectInnerHeightPercent * height / 2 + 1;

    if (x > this.scene.origin.x) {
      pointsOuter = this.vertEdgePoints(xLeftOuter, yTopOuter, yBottomOuter);
      pointsInner = this.vertEdgePoints(xRightInner, yTopInner, yBottomInner);
    } else {
      pointsOuter = this.vertEdgePoints(xRightOuter, yTopOuter, yBottomOuter);
      pointsInner = this.vertEdgePoints(xLeftInner, yTopInner, yBottomInner);
    }

    this.setPoints(this.vertEdgeOuter, this.vertEdgeGraphics, pointsOuter);
    this.setPoints(this.vertEdgeInner, this.vertEdgeGraphics, pointsInner);

    if (y > this.scene.origin.y) {
      pointsOuter = this.horizEdgePoints(yTopOuter, xLeftOuter, xRightOuter);
      pointsInner = this.horizEdgePoints(yBottomInner, xLeftInner, xRightInner);

    } else {
      pointsOuter = this.horizEdgePoints(yBottomOuter, xLeftOuter, xRightOuter);
      pointsInner = this.horizEdgePoints(yTopInner, xLeftInner, xRightInner);
    }

    this.setPoints(this.horizEdgeOuter, this.horizEdgeGraphics, pointsOuter);
    this.setPoints(this.horizEdgeInner, this.horizEdgeGraphics, pointsInner);

    // The edge of the main shape, do like this so the edge width is constant and consistant 
    // with the other edges. Could also modify edge with this.setStrokeStyle(4, 0x000000, 1.0)
    pointsOuter = [
      x + width / 2, y + height / 2,
      x - width / 2, y + height / 2,
      x - width / 2, y - height / 2,
      x + width / 2, y - height / 2,
    ]

    this.mainEdgeOuter.setTo(pointsOuter);
    this.mainEdgeGraphics.strokePoints(this.mainEdgeOuter.points, true);

    pointsInner = [
      x + this.rectInnerWidthPercent * width / 2, y + this.rectInnerHeightPercent * height / 2,
      x - this.rectInnerWidthPercent * width / 2, y + this.rectInnerHeightPercent * height / 2,
      x - this.rectInnerWidthPercent * width / 2, y - this.rectInnerHeightPercent * height / 2,
      x + this.rectInnerWidthPercent * width / 2, y - this.rectInnerHeightPercent * height / 2,
    ]

    this.mainEdgeInner.setTo(pointsInner);
    this.mainEdgeGraphics.strokePoints(this.mainEdgeInner.points, true);

    let angle = Math.atan2(x - this.scene.origin.x, y - this.scene.origin.y);
    if ((angle > -Phaser.Math.PI2 / 8 & angle < Phaser.Math.PI2 / 8) | (angle > 3 * Phaser.Math.PI2 / 8 | angle < -3 * Phaser.Math.PI2 / 8)) {
      this.vertEdgeGraphics.setDepth(this.depth - 1);
      this.horizEdgeGraphics.setDepth(this.depth);
    } else {
      this.vertEdgeGraphics.setDepth(this.depth);
      this.horizEdgeGraphics.setDepth(this.depth - 1);
    }
  }

  getArea() {
    // Return area in world coords
    let { x, y, width, height } = this.getWorldPos();
    let area = width * height;

    // Subtract the area of the middle bit 
    return area * (1 - this.rectInnerWidthPercent * this.rectInnerHeightPercent);
  }
}

class MysteriousShapeFull extends MysteriousShape {
  constructor(scene, id, fadeIn) {
    let rectWidth = Phaser.Math.RND.between(180, 260);
    let rectHeight = Phaser.Math.RND.between(180, 260);

    let points = [
      0, rectHeight,
      rectWidth, rectHeight,
      rectWidth, 0,
      0, 0,
    ]
    super(scene, points, id, fadeIn);

    this.mainEdgeOuter = new Phaser.Geom.Polygon([]);
    this.vertEdgeOuter = new Phaser.Geom.Polygon([]);
    this.horizEdgeOuter = new Phaser.Geom.Polygon([]);
  }

  addEdges() {
    this.clearGraphics();
    let { x, y, width, height } = this.getWorldPos();

    // Set the properties before drawing the lines or it won't work
    this.mainEdgeGraphics.lineStyle(4, 0x000000, this.alpha);

    this.vertEdgeGraphics.fillStyle(SHAPE_COLOURS_HEX_DARK[this.vertEdgeId], this.alpha);
    this.vertEdgeGraphics.lineStyle(2, 0x000000, this.alpha);

    this.horizEdgeGraphics.fillStyle(SHAPE_COLOURS_HEX_DARK[this.horizEdgeId], this.alpha);
    this.horizEdgeGraphics.lineStyle(2, 0x000000, this.alpha);

    let pointsOuter;

    // Make slightly wider to account for the thickness of the edge line 
    let xLeftOuter = x - width / 2 - 1;
    let xRightOuter = x + width / 2 + 1;
    let yTopOuter = y - height / 2 - 1;
    let yBottomOuter = y + height / 2 + 1;

    if (x > this.scene.origin.x) {
      pointsOuter = this.vertEdgePoints(xLeftOuter, yTopOuter, yBottomOuter);
    } else {
      pointsOuter = this.vertEdgePoints(xRightOuter, yTopOuter, yBottomOuter);
    }

    this.setPoints(this.vertEdgeOuter, this.vertEdgeGraphics, pointsOuter);

    if (y > this.scene.origin.y) {
      pointsOuter = this.horizEdgePoints(yTopOuter, xLeftOuter, xRightOuter);
    } else {
      pointsOuter = this.horizEdgePoints(yBottomOuter, xLeftOuter, xRightOuter);
    }

    this.setPoints(this.horizEdgeOuter, this.horizEdgeGraphics, pointsOuter);

    // The edge of the main shape, do like this so the edge width is constant and consistant 
    // with the other edges. Could also modify edge with this.setStrokeStyle(4, 0x000000, 1.0)
    pointsOuter = [
      x + width / 2, y + height / 2,
      x - width / 2, y + height / 2,
      x - width / 2, y - height / 2,
      x + width / 2, y - height / 2,
    ]

    this.mainEdgeOuter.setTo(pointsOuter);
    this.mainEdgeGraphics.strokePoints(this.mainEdgeOuter.points, true);

    let angle = Math.atan2(x - this.scene.origin.x, y - this.scene.origin.y);
    if ((angle > -Phaser.Math.PI2 / 8 & angle < Phaser.Math.PI2 / 8) | (angle > 3 * Phaser.Math.PI2 / 8 | angle < -3 * Phaser.Math.PI2 / 8)) {
      this.vertEdgeGraphics.setDepth(this.depth - 1);
      this.horizEdgeGraphics.setDepth(this.depth);
    } else {
      this.vertEdgeGraphics.setDepth(this.depth);
      this.horizEdgeGraphics.setDepth(this.depth - 1);
    }
  }

  getArea() {
    // Return area in world coords
    let { x, y, width, height } = this.getWorldPos();
    return width * height;
  }
}

export { MysteriousShape, MysteriousShapeFull, MysteriousShapeHollow };
