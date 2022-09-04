import { ShapeNetwork } from './shape-network.js';

class ShapeContainer {
  constructor(scene, x, y, scale, shape, depthLevel = 0, fadeIn = false) {
    this.scene = scene;

    this.xSpeed = 0.28;
    this.ySpeed = 0.32;

    this.container = scene.add.container(x, y, []);
    scene.add.existing(this.container);

    this.container.scaleX = scale;
    this.container.scaleY = scale;

    if (shape) this.addShape(shape);
    this.shapeNetwork = new ShapeNetwork(shape);

    this.runUpdate = true;

    this.calculateDirection();

    this.hasHitBoundary = false;

    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(5, 0xFF00FF, 1.0);

    this.setDepthLevel(depthLevel);
    // this.nodeIdText = [];
  }

  setSpeed(xSpeed, ySpeed) {
    if (ySpeed) {
      this.xSpeed = xSpeed;
      this.ySpeed = ySpeed;
    } else {
      this.xSpeed = xSpeed;
      this.ySpeed = xSpeed;
    }
  }

  update() {
    if (this.runUpdate) {
      let { width, height } = this.scene.sys.game.canvas;

      if (this.container.scaleX <= 0.5) {
        this.container.scaleX *= 1.00135;
        this.container.scaleY *= 1.00135;
      }
      this.container.x += this.xSpeed * this.direction.x;
      this.container.y += this.ySpeed * this.direction.y;

      // Do you want to do this every frame?
      if (this.scene.sinks.length > 0) {
        this.calculateDirection();
      }

      let centroid = this.getCentroid();
      if (centroid.x < -160 | centroid.x > width + 160 | centroid.y < -160 | centroid.y > height + 160) {
        if (!this.hasHitBoundary) {
          this.hasHitBoundary = true;
          this.hitBoundary();
        }
      }
    }

    // this.drawNetwork();
  }

  hitBoundary() {
    this.scene.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 800,
      ease: 'Power2',
      yoyo: false,
      onUpdate: function (tween) {
        const value = tween.getValue();
        this.setAlphas(value)
      }.bind(this),
      onComplete: function () {
        this.remove();
      }.bind(this)
    });
  }

  setAlphas(value) {
    this.container.setAlpha(value);
    this.container.iterate(function (shape) {
      shape.alpha = value;
    });
  }

  pauseUpdate() {
    this.runUpdate = false;
  }

  unpauseUpdate() {
    this.runUpdate = true;
  }

  merge(moveShape, collideShape) {
    console.log('Merging shapes');
    let collideObj = collideShape.parent;

    collideObj.container.each(function (shape) {
      this.addShapeFromContainer(collideObj.container, shape);
    }, this);

    this.updateSeparations(this.scene.draggedShape);
    this.updateDepth();

    // This check stops simultaneous collions causing crash, hopefully!
    if (collideObj.shapeNetwork.nodes.length > 0) {
      this.shapeNetwork.merge(collideObj.shapeNetwork.nodes, [[moveShape, collideShape]]);
    }
    // Remove this container from update list
    collideObj.remove();

    // Check if there are big enough clusters to score points
    this.checkClusters();
  }

  addShape(shape) {
    this.container.add(shape);
    shape.setParent(this);
    shape.addEdges();
    this.calculateDirection();
  }

  addShapeFromContainer(container, shape) {
    // Get relative position in the new container 
    let shapeWorldPos = this.getShapeWorldPos(container, shape);
    let newContainerX = (shapeWorldPos.x - this.container.x) / this.container.scaleX;
    let newContainerY = (shapeWorldPos.y - this.container.y) / this.container.scaleX;
    shape.setPosition(newContainerX, newContainerY);

    let shapeWorldScale = this.getShapeWorldScale(container, shape);
    shape.setScale(shapeWorldScale / this.container.scaleX);

    // Move from old container to this one
    container.remove(shape);
    this.addShape(shape);
  }

  updateSeparations(dragShape) {
    if (dragShape) {
      this.container.iterate(function (shape) {
        shape.separation = new Phaser.Math.Vector2(shape.x - dragShape.x, shape.y - dragShape.y);
      });
    }
  }

  updateDepth() {
    // Change depth to be in range this.depth-52..this.depth-2, based on shape width (assume in range 0-200, though probably not go that high)
    this.container.each(function (shape) {
      let { x, y, width, height } = shape.getWorldPos();
      shape.setDepth(50 * (200 - width) / (200) + this.container.depth - 52);
      shape.updateDepth(50 * (200 - width) / (200) + this.container.depth - 52, this.container.depth);
    }, this);
  }

  moveToTop() {
    this.setDepthLevel(4);
  }

  setDepthLevel(level) {
    // level is int, make depth of this 50+level*50, alternate in spawn

    this.container.setDepth(52 + 52 * level);
    this.updateDepth();
  }

  checkClusters(minSize = 4, id = -1) {
    let scoreClusters = this.shapeNetwork.findClusters(minSize, id);

    scoreClusters.forEach(cluster => {
      let score = 0;
      let id;
      cluster.forEach(nodeIndex => {
        let shape = this.shapeNetwork.nodes[nodeIndex].shape;
        this.container.remove(shape);
        score += shape.score();
        if (!id) id = shape.id;
        this.setShapeWorldPos(this.container, shape);
        shape.remove();
      });
      this.scene.updateGameScore(score, id);
    });

    // Doing this in the above loop will change the indicies of the nodes, can you do it better?
    scoreClusters.forEach(cluster => {
      this.shapeNetwork.dropNodes(cluster);
    });

    if (scoreClusters.length > 0) {
      let subNetworks = this.shapeNetwork.findSubNetworks();
      this.breakApart(subNetworks);
    };
  }

  breakApart(subNetworks) {
    if (this.container.exists(this.scene.draggedShape)) {
      this.scene.canDrag = false;
    }

    subNetworks.forEach(function (subNetwork) {
      // Use first shape to set position of new container
      let shape = this.shapeNetwork.nodes[subNetwork[0]].shape;

      let shapeWorldpos = shape.getWorldPos();
      let newContainer = new ShapeContainer(this.scene, shapeWorldpos.x, shapeWorldpos.y, 1);

      let newNodes = [];
      subNetwork.forEach(function (nodeIndex) {
        newContainer.addShapeFromContainer(this.container, this.shapeNetwork.nodes[nodeIndex].shape);
        newNodes.push(this.shapeNetwork.nodes[nodeIndex]);
      }.bind(this));

      newContainer.shapeNetwork.setNodes(newNodes);
      newContainer.shapeNetwork.remapConnections(subNetwork);
      newContainer.updateDepth();

      this.scene.shapeContainers.push(newContainer); // Need to do this so update called on container
    }.bind(this));

    this.remove();
  }

  mergeEffect(ContainerShape, collisionShape) {
    console.log('Merge effect');
    if (ContainerShape.id == 0) {
      if (collisionShape.id == 1) {
        // blue to red: increase speed
        this.xSpeed *= 10;
        this.ySpeed *= 10;
      } else if (collisionShape.id == 2) {
        // blue to white: spawn yellow destroyer
        let dir = new Phaser.Math.Vector2(Phaser.Math.FloatBetween(-0.25, 0.25), Phaser.Math.FloatBetween(-0.25, 0.25));
        const pos = collisionShape.getWorldPos();
        this.scene.spikeShapes.get(pos.x, pos.y, 3, dir.normalize());
      } else if (collisionShape.id == 3) {
        // blue to yellow: shrink
        const initialScale = this.container.scaleX
        this.scene.tweens.add({
          targets: this.container,
          scaleX: 0.5 * initialScale,
          scaleY: 0.5 * initialScale,
          duration: 1000
        });
      }
    } else if (ContainerShape.id == 1) {
      if (collisionShape.id == 0) {
        // red to blue: increase speed
        this.xSpeed *= 10;
        this.ySpeed *= 10;
      } else if (collisionShape.id == 2) {
        // red to white: destroy both
        this.destroyShapes([ContainerShape, collisionShape]);
      } else if (collisionShape.id == 3) {
        // red to yellow: change red to yellow
        ContainerShape.changeId(3);
        this.checkClusters();
      }
    } else if (ContainerShape.id == 2) {
      if (collisionShape.id == 0) {
        // white to blue: spawn yellow destroyer
        let dir = new Phaser.Math.Vector2(Phaser.Math.FloatBetween(-0.25, 0.25), Phaser.Math.FloatBetween(-0.25, 0.25));
        const pos = collisionShape.getWorldPos();
        this.scene.spikeShapes.get(pos.x, pos.y, 3, dir.normalize());
      } else if (collisionShape.id == 1) {
        // white to red: destroy both
        this.destroyShapes([ContainerShape, collisionShape]);
      } else if (collisionShape.id == 3) {
        // white to yellow: break into same colour clusters     
        let subNetworks = this.shapeNetwork.findClusters(1);
        this.breakApart(subNetworks);
      }
    } else {
      if (collisionShape.id == 0) {
        // yellow to blue: shrink
        const initialScale = this.container.scaleX
        this.scene.tweens.add({
          targets: this.container,
          scaleX: 0.5 * initialScale,
          scaleY: 0.5 * initialScale,
          duration: 1000
        });
      } else if (collisionShape.id == 1) {
        // yellow to red: change red to yellow
        collisionShape.changeId(3);
        this.checkClusters();
      } else if (collisionShape.id == 2) {
        // yellow to white: break into same colour clusters 
        let subNetworks = this.shapeNetwork.findClusters(1);
        this.breakApart(subNetworks);
      }
    }
  }

  destroyShapes(shapes, target) {
    console.log('Destroying shapes');
    let nodesToDrop = [];
    shapes.forEach(function (shape) {
      nodesToDrop.push(this.shapeNetwork.getNodeIndex(shape));
      this.container.remove(shape);
      this.setShapeWorldPos(this.container, shape);
      shape.remove(target);
    }.bind(this));

    this.shapeNetwork.dropNodes(nodesToDrop);
    let subNetworks = this.shapeNetwork.findSubNetworks();
    this.breakApart(subNetworks);
  }

  getShapeWorldPos(container, shape) {
    let worldX = container.scaleX * shape.x + container.x;
    let worldY = container.scaleX * shape.y + container.y;
    return new Phaser.Math.Vector2(worldX, worldY);
  }

  getShapeWorldScale(container, shape) {
    return shape.scaleX * container.scaleX;
  }

  setShapeWorldPos(container, shape) {
    let shapeWorldPos = this.getShapeWorldPos(container, shape);

    shape.setPosition(shapeWorldPos.x, shapeWorldPos.y);

    let shapeWorldScale = this.getShapeWorldScale(container, shape);
    shape.setScale(shapeWorldScale);
  }

  calculateDirection() {
    const originAngle = this.angleToTarget(this.scene.origin);
    let direction = new Phaser.Math.Vector2(-Math.cos(originAngle), -Math.sin(originAngle));
    for (var target of this.scene.sinks) {
      const targetAngle = this.angleToTarget(target);
      direction.add(new Phaser.Math.Vector2(Math.cos(targetAngle) / 2, Math.sin(targetAngle) / 2));
    }

    // Normalise so speed is the same
    this.direction = direction.normalize();
  }

  setDirection(direction) {
    this.direction = direction;
  }

  angleToTarget(target) {
    return Phaser.Math.Angle.BetweenPoints(this.getCentroid(), target);
  }

  distanceToTarget(target) {
    return Phaser.Math.Distance.BetweenPoints(this.getCentroid(), target)
  }

  getCentroid() {
    // Get the midpoint of the objects in the container
    let centroid = new Phaser.Math.Vector2();

    this.container.iterate(function (shape) {
      centroid = centroid.add(this.getShapeWorldPos(this.container, shape));
    }, this);

    centroid = centroid.scale(1 / this.container.length);

    return centroid
  }

  remove() {
    // Clear graphics from child shapes
    this.container.iterate(function (shape) {
      shape.clearGraphics();
    });

    // Remove this object from update list
    const index = this.scene.shapeContainers.indexOf(this);
    if (index > -1) {
      this.scene.shapeContainers.splice(index, 1); // 2nd parameter means remove one item only
    }
    // Stop updates and delete container, is this sufficient to remove it from game?
    this.runUpdate = false;
    this.container.destroy();

    // this.graphics.clear();
    // this.nodeIdText.forEach(function (nodeIdText) {
    //   nodeIdText.destroy();
    // });
  }

  drawNetwork() {
    this.graphics.clear();
    this.graphics.lineStyle(5, 0xFF00FF, 1.0).setDepth(2000);

    this.nodeIdText.forEach(function (nodeIdText) {
      nodeIdText.destroy();
    });
    this.nodeIdText = [];
    this.shapeNetwork.nodes.forEach(function (node, i) {
      let nodePos = node.shape.getWorldPos();
      let nodeIdText = this.scene.add.bitmapText(nodePos.x, nodePos.y, 'mont', i, 30).setOrigin(0.5).setDepth(2000).setTint('k');

      this.nodeIdText.push(nodeIdText);

      node.connections.forEach(function (connection) {
        let connectionPos = this.shapeNetwork.nodes[connection].shape.getWorldPos();
        this.graphics.strokeLineShape({
          x1: nodePos.x,
          y1: nodePos.y,
          x2: connectionPos.x,
          y2: connectionPos.y
        });
      }.bind(this));
    }.bind(this))
  }
}

export { ShapeContainer };
