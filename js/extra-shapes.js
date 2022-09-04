const SHAPE_COLOURS_HEX = [0x5f6ee5, 0xe5557d, 0xffffff, 0xf4da76];

class SpikeShape extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, id, direction) {
    super(scene, x, y).setDepth(400);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const rotation = 0;
    this.setRotation(rotation);

    const radius = 10;
    this.body.setCircle(
      radius,
      (this.displayWidth + radius) / 2,
      (this.displayHeight + radius) / 2,
    );

    this.play('pulse');

    this.id = id;
    this.setTint(SHAPE_COLOURS_HEX[id]);
    this.direction = direction;
  }

  update() {
    this.x += 0.48 * this.direction.x;
    this.y += 0.48 * this.direction.y;

    let { width, height } = this.scene.sys.game.canvas;
    if (this.x < -100 | this.x > width + 100) {
      this.destroy();
    }
  }
}

class Sucker extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'black-hole');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const radius = 20;
    this.body.setCircle(
      radius,
      this.displayWidth / 2 - radius,
      this.displayHeight / 2 - radius
    );

    this.swirlPlugin = scene.plugins.get('rexswirlpipelineplugin');
    this.swirl = this.swirlPlugin.add(scene.cameras.main, {
      center: {
        x: x,
        y: y
      },
      angle: 20,
      radius: 60
    });

    this.direction = new Phaser.Math.Vector2(-1, Phaser.Math.FloatBetween(-0.25, 0.25));
  }

  update() {
    this.x += 0.18 * this.direction.x;
    this.y += 0.18 * this.direction.y;

    this.scale -= 0.0002;

    this.swirl.setCenter(this.x, this.y);
    this.swirl.radius = 60 * this.scale;

    this.scene.sinks[0] = this.getCenter();
    // this.scene.target = this.getCenter();
    // this.scene.speedToTarget = 1;


    let { width, height } = this.scene.sys.game.canvas;
    if (this.x < -45 | this.x > width + 45 | this.scale < 0.1) {
      // this.scene.target = this.scene.origin;
      this.scene.sinks = [];
      // this.scene.speedToTarget = -1;
      this.swirlPlugin.remove(this.scene.cameras.main);
      this.destroy();
    }
  }
}

class BonusBall extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, id) {
    super(scene, x, y, 'ball');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.id = id;
    this.setTint(SHAPE_COLOURS_HEX[id]);

    const radius = 10;
    this.body.setCircle(
      radius,
      (this.displayWidth + radius) / 2,
      (this.displayHeight + radius) / 2,
    );

    this.direction = new Phaser.Math.Vector2(Phaser.Math.FloatBetween(-0.25, 0.25), 1);
  }

  update() {
    this.x += 0.48 * this.direction.x;
    this.y += 0.48 * this.direction.y;

    let { width, height } = this.scene.sys.game.canvas;
    if (this.x < -100 | this.x > width + 100) {
      this.destroy();
    }
  }
}

export { SpikeShape, Sucker, BonusBall };
