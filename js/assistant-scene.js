export default class AssistantScene extends Phaser.Scene {

  constructor() {
    super('AssistantScene');
  }

  preload() {
    // Backgrounds
    this.load.image('button', 'assets/images/backgrounds/button.png');
    // this.load.image('light', 'assets/images/backgrounds/light.png');

    // // Plugins
    // this.load.plugin('rexswirlpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexswirlpipelineplugin.min.js', true);

    // Audio
    this.load.audio('the-assistant', 'assets/audio/the-assistant.mp3', { stream: true }); // What does stream do??????

    // Default background placeholders, the actual ones will be loaded dynamically
    this.load.image('default_background', 'assets/images/backgrounds/default_background.png');
    this.load.image('default_midground', 'assets/images/backgrounds/default_midground.png');
    this.load.image('default_foreground', 'assets/images/backgrounds/default_foreground.png');
    this.load.image('text_background', 'assets/images/backgrounds/text_background.png');

    // this.load.image('bg', `assets/images/backgrounds/${'graveyard_background.png'}`);


    // For testing that the loading screen works
    // for (var i = 0; i < 50; i++) {
    //   this.load.image(`light_${i}`, 'assets/images/backgrounds/light.png');
    // }

    // Game assets
    // this.load.image('black-hole', 'assets/sprites/black-hole.png');
    this.load.image('item', 'assets/sprites/ball.png');
    // this.load.atlas('star', 'assets/sprites/star.png', 'assets/sprites/star.json');

    // JSON files
    this.load.json('story-text', 'assets/json/story-text.json');
  }

  create(params = { 'pauseAtStart': true, 'muteSong': false, 'firstGame': false }) {
    this.input.setDefaultCursor('url(assets/cursors/hand.cur), pointer');

    // I don't want the canvas to fill the screen on desktop, so set default size. This should only affect the 
    // aspect ratio since it is using scale.FIT
    if (this.sys.game.device.os.desktop) {
      this.scale.setGameSize(380, 720);
    }
    // get this after resizing, obviously
    let { width, height } = this.sys.game.canvas;

    this.backgroundOrigin = new Phaser.Math.Vector2(width / 2, height);
    this.origin = new Phaser.Math.Vector2(width / 2, height / 2);
    this.addDefaultBackgrounds();

    this.buttons = this.add.group({ classType: Button });
    this.textBackground = this.add.image(width / 2, 40, 'text_background').setOrigin(0.5, 0).setScale(1.2);
    this.displayText = this.add.bitmapText(width / 2, 40, 'mont', '', 26).setCenterAlign().setOrigin(0.5, 0).setTint('w');
    this.displayText.setMaxWidth(width - 80);


    // this.add.bitmapText(width / 2, 50, 'mont', 'Items', 18).setCenterAlign().setOrigin(0.5, 0).setTint('k');
    // this.add.bitmapText(width / 2, 140, 'mont', 'Other', 18).setCenterAlign().setOrigin(0.5, 0).setTint('k');

    // ONly makie visiblbe when have items
    // this.addItemsMenu();

    this.storyText = this.cache.json.get('story-text');

    this.playerItems = [];
    this.playerCollectibles = [];
    this.playerEvents = []; // Make these sets?
    this.setScene('graveyardStart');

    this.displayItems = [];


    // this.paralax();


    // this.addItem('item');
    // this.addItem('item');
    // this.addItem('item');
    // this.addItem('item');
    // this.addItem('item');
    // this.addItem('item');
    // this.addItem('item');
    // this.addItem('item');
    // let background = this.add.image(width / 2, height / 2, 'button').setOrigin(0.5).setInteractive();
    // background.on('pointerdown', () => {
    //   console.log(this.playerItems)
    // });

    // let a = 'a'
    // let b = ['a', 'b']
    // let oo = ['a', 'b', 'c']

    // console.log(a.every(v => oo.includes(v)))

    // this.storyText = this.add.bitmapText(width / 2, 120, 'mont', 'Lots of words words\nworrds sdluhgs lsiuh\nlsduh sldh lsikdh lkshd\nlikshd iklsh d', 26).setCenterAlign().setOrigin(0.5).setTint('k');


    // this.addButtons(['button1', 'button2', 'button3']);

    // // console.log(this.buttons.getChildren().length)


    // // this.background = this.add.image(120, 120, 'button').setOrigin(0.5);

    // // let a = this.add.group({ classType: Button, runChildUpdate: true });
    // // let oo = a.get(width - 120, height - 140, 'button 1')
    // // let oo = new Button(this, width - 120, height - 220, 'button 1');//.setOrigin(1, 0);
    // // let aa = new Button(this, 120, height - 120, 'button 0');//.setOrigin(1, 0);

    // // let oo = this.add.bitmapText(width - 20, height - 140, 'mont', 'button 1', 26).setCenterAlign().setOrigin(1, 0).setTint('k').setInteractive();
    // // oo.on('pointerdown', () => {
    // //   console.log("HI")
    // // });
    // // aa.on('pointerdown', () => {
    // //   console.log("Ho")
    // // });
    // // console.log(oo.list)

    // this.tweens.addCounter({
    //   from: 0,
    //   to: 1,
    //   duration: 30000,
    //   onUpdate: function (tween) {
    //     this.buttons.getChildren().forEach(function (button) {
    //       button.updateTimer(tween.getValue());
    //     });
    //   }.bind(this),
    //   onComplete: function () {
    //     this.buttons.children.each(function (button) {
    //       button.destroy();
    //     });
    //     this.nextScene()
    //   }.bind(this)
    // });


    // let r = Phaser.Math.Between(0, this.buttons.getChildren().length - 1);
    // this.updateActiveButton(this.buttons.getChildren()[r]);




    // this.time.addEvent({
    //   delay: 5000,
    //   loop: false,
    //   callback: function (time) {
    //     oo.updateTimer(time);
    //   },
    //   callbackScope: this
    // }, this);


    // this.backgroundOrigin = new Phaser.Math.Vector2(width / 2, height / 2 - 50);

    // this.sinks = [];

    // this.setUpShapes();
    // this.setUpDrag();

    // if (params['firstGame']) {
    //   this.displayTutorialText();
    // }
    // this.initialSpawn();

    // this.addBackground();

    // // Store each score and time it was added in separate arrays, is this the best way to find 
    // // score at a specific time? Also have a score that is not time dependent
    // this.scores = [0];
    // this.scoreTimes = [0];
    // this.fixedScore = 0;

    this.playerScene = this.scene.get('PlayerScene');

    // // How make song not play a little if pause at start?
    this.song = this.sound.add('the-assistant');
    this.song.on('complete', function () {
      this.playerScene.endGame();
    }, this);

    this.song.play();
    this.song.seek = 33;
  }

  // addItemsMenu() {
  //   let { width, height } = this.sys.game.canvas;
  //   this.add.bitmapText(width / 2, 50, 'mont', 'Items', 18).setCenterAlign().setOrigin(0.5, 0).setTint('k');

  //   const itemWidth = 40
  //   for (var i = -2; i < 3; i++) {
  //     new DisplayItem(this, width / 2 + i * (itemWidth + 5), 80, itemWidth);
  //   }
  // }

  addItem(item) {
    let { width, height } = this.sys.game.canvas;
    const itemWidth = 40;
    let displayX;
    let displayY;
    if (item.includes('Arm') | item.includes('Leg') | item.includes('Torso')) {
      this.playerCollectibles.push(item);
      displayX = width - itemWidth / 2 - 2;
      displayY = this.playerCollectibles.length * (itemWidth + 5)
    } else {
      this.playerItems.push(item);
      displayX = itemWidth / 2 + 2;
      displayY = this.playerItems.length * (itemWidth + 5)
    }

    // const itemsLen = this.displayItems.length;
    this.displayItems.push(new DisplayItem(this, displayX, displayY + 160, itemWidth, item));
    // const itemsLen = this.displayItems.length;
    // this.displayItems.forEach((item, i) => {
    //   item.setYPos(80 - (i - (itemsLen - 1) / 2) * (itemWidth + 5));
    // });
    // this.displayItems.forEach((item, i) => {
    //   item.setXPos(width / 2 + (i - (itemsLen - 1) / 2) * (itemWidth + 5));
    // });
  }

  setScene(sceneId) {
    console.log('Next scene: ', sceneId);
    this.updateBackground(this.storyText[sceneId]['backgrounds']);
    // console.log(this.storyText[sceneId])
    this.displayText.text = this.storyText[sceneId]['storyText'];
    this.textBackground.displayHeight = this.displayText.height + 20;
    // console.log(this.displayText.getTextBounds());
    this.addButtons(this.storyText[sceneId]['options']); //['buttonText'], this.storyText[sceneId]['buttonResponse'], this.storyText[sceneId]['item']);
    this.buttonTimer(this.storyText[sceneId]['duration']);
    // this.paralax();
  }

  addButtons(options) {
    let { width, height } = this.sys.game.canvas;
    const buttonWidth = 140, buttonHeight = 60; // width 140 try bigger??

    options = this.getValidOptions(options);

    const xPadding = (width - 2 * buttonWidth) / 4, xLeft = buttonWidth / 2 + xPadding, xRight = width - buttonWidth / 2 - xPadding;

    options.forEach((option, index) => {
      let button;
      if (index % 2 == 0 & index == options.length - 1) {
        button = new Button(this, width / 2, height - (index / 2) * buttonHeight - 80, option, buttonWidth);
      } else {
        button = new Button(this, (index % 2 == 0) ? xLeft : xRight, height - Math.floor(index / 2) * buttonHeight - 80, option, buttonWidth);
      }
      this.buttons.add(button);
    });
  }

  addDefaultBackgrounds() {
    // let { width, height } = this.sys.game.canvas;
    let background = this.add.image(this.backgroundOrigin.x, this.backgroundOrigin.y, 'default_background').setOrigin(0.5, 1).setScale(1.2);
    let midground = this.add.image(this.backgroundOrigin.x, this.backgroundOrigin.y, 'default_midground').setOrigin(0.5, 1).setScale(1.2);
    let foreground = this.add.image(this.backgroundOrigin.x, this.backgroundOrigin.y, 'default_foreground').setOrigin(0.5, 1).setScale(1.2);

    this.backgrounds = [background, midground, foreground];
  }

  updateBackground(backgrounds) {
    backgrounds = backgrounds ? backgrounds : {};
    let keys = ["background", "midground", "foreground"];
    keys.forEach(function (key, i) {
      let texture = backgrounds[key] ? backgrounds[key] : `default_${key}`;
      if (this.textures.exists(texture)) {
        this.backgrounds[i].setTexture(texture);
      } else {
        this.load.image(texture, `assets/images/backgrounds/${texture}`);
        this.load.start();
        this.load.once(Phaser.Loader.Events.COMPLETE, () => {
          this.backgrounds[i].setTexture(texture);
        });
      }
    }, this);

    // for (key )
    // backgrounds[]
    // console.log
    // backgrounds = backgrounds ? backgrounds : [];

    // for (let i = 0; i < this.backgrounds.length; i++) {
    //   this.load.image(backgrounds[i], `assets/images/backgrounds/${backgrounds[i]}.png`);
    //   this.load.start();
    //   this.load.once(Phaser.Loader.Events.COMPLETE, () => {
    //     this.backgrounds[i].setTexture(backgrounds[i]);
    //   });
    // }

    console.log(backgrounds);
    // if (backgrounds) {
    //   for (let i = 0; i < backgrounds.length; i++) {
    //     this.load.image(backgrounds[i], `assets/images/backgrounds/${backgrounds[i]}.png`);
    //     this.load.start();
    //     this.load.once(Phaser.Loader.Events.COMPLETE, () => {
    //       this.backgrounds[i].setTexture(backgrounds[i]);
    //     });
    //   }
    // console.log(backgrounds);
    // backgrounds.forEach(background => {
    //   console.log(background);
    //   this.load.image('bg', `assets/images/backgrounds/${background}`);
    //   this.load.start();
    //   this.load.once(Phaser.Loader.Events.COMPLETE, () => {
    //     console.log("HI");
    //     this.add.image(width / 2, height / 2, 'bg').setOrigin(0.5)

    //   });

    // this.add.image(100, 0, 'itemoo').setOrigin(0.5);

    // });
    // }
    // 

    // this.add.image(width / 2, height / 2, 'bg').setOrigin(0.5);

    // this.load.image('item', 'assets/sprites/ball.png');

  }

  moveBackground() {
    const angle = Phaser.Math.Angle.BetweenPoints(this.input.mousePointer.position, this.origin);
    const distance = Phaser.Math.Distance.BetweenPoints(this.input.mousePointer.position, this.origin);

    let direction = new Phaser.Math.Vector2();
    direction = direction.setToPolar(angle, Math.min(distance, 100) / 10);  //distance > 10 ? 10 : 0);// Math.min(distance, 10)

    // console.log(Math.min(distance, 10));

    this.backgrounds.forEach(function (background, i) {
      background.x = this.backgroundOrigin.x + (i + 1) * direction.x;
      background.y = this.backgroundOrigin.y + (i + 1) * direction.y;
    }, this);

    // const distance = Phaser.Math.Distance.BetweenPoints(
    //   new Phaser.Math.Vector2(width / 2 + target.x, height - 40 + target.y),
    //   new Phaser.Math.Vector2(this.backgrounds[0].x, this.backgrounds[0].y)
    // );
  }

  paralax() {
    console.log(this.input.mousePointer.position);
    // Choose random point in circle around middle
    // let { width, height } = this.sys.game.canvas;

    // // let direction = new Phaser.Math.Vector2();
    // // const angle = this.spawnIndex * Phaser.Math.PI2 / 4 + Phaser.Math.FloatBetween(-0.4, 0.4);
    // // direction.setToPolar(angle, 4);

    // // Keep speed the same, use angle
    // let target = new Phaser.Math.Vector2(Phaser.Math.FloatBetween(-10.0, 10.0), Phaser.Math.FloatBetween(-10.0, 10.0));
    // const distance = Phaser.Math.Distance.BetweenPoints(
    //   new Phaser.Math.Vector2(width / 2 + target.x, height - 40 + target.y),
    //   new Phaser.Math.Vector2(this.backgrounds[0].x, this.backgrounds[0].y)
    // );
    // // console.log(distance);
    // // console.log(1 * target.x);
    // this.backgrounds.forEach(function (background, i) {
    //   this.tweens.add({
    //     targets: background,
    //     x: width / 2 + (i + 1) * target.x,
    //     y: height - 40 + (i + 1) * target.y,
    //     duration: 12000 / distance,
    //     // ease: 'Power2',
    //     onComplete: function () {
    //       // if (this.)
    //       // this.paralax();
    //       // this.scoreText.setTint(0xffffff);
    //       // emitter.explode(10, width - 20 - this.scoreText.width / 2, 20);
    //     }.bind(this)
    //     // yoyo: true
    //   });
    // }, this);
  }

  getValidOptions(options) {
    let validOptions = options.filter(function (option) {
      const req = option['requirement']
      if (req) {
        if ('item' in req) {
          return this.playerItems.includes(req['item']);
        } else if ('event' in req) {
          return this.playerEvents.includes(req['event']);
        } else if ('notEvent' in req) {
          return !this.playerEvents.includes(req['notEvent']);
        } else {
          return true;
        }
      } else {
        return true;
      }
    }, this);
    return validOptions;
  }
  // console.log(options)
  // let validOptions = Array.from(Array(buttonText.length).keys());
  // // let org;
  // if (buttonRequirement) {
  //   validOptions = validOptions.filter(function (i) {
  //     if ('item' in buttonRequirement[i]) {
  //       return this.playerItems.includes(buttonRequirement[i]['item']);
  //     } else if ('event' in buttonRequirement[i]) {
  //       return this.playerEvents.includes(buttonRequirement[i]['event']);
  //     } else if ('notEvent' in buttonRequirement[i]) {
  //       return !this.playerEvents.includes(buttonRequirement[i]['notEvent']);
  //     } else {
  //       return true;
  //     }
  //   }, this);
  // }
  // }
  // addButtons(buttons) {
  //   let { width, height } = this.sys.game.canvas;
  //   const buttonWidth = 140, buttonHeight = 60;

  //   const buttonText = sceneJson['buttonText'];
  //   const buttonResponse = sceneJson['buttonResponse'];
  //   const buttonItem = sceneJson['item'] ? sceneJson['item'] : Array.from({ length: buttonResponse.length }, () => '');
  //   const buttonEvent = sceneJson['event'] ? sceneJson['event'] : Array.from({ length: buttonResponse.length }, () => '');
  //   const buttonRequirement = sceneJson['requirement'];

  //   let validOptions = Array.from(Array(buttonText.length).keys());
  //   // let org;
  //   if (buttonRequirement) {
  //     validOptions = validOptions.filter(function (i) {
  //       if ('item' in buttonRequirement[i]) {
  //         return this.playerItems.includes(buttonRequirement[i]['item']);
  //       } else if ('event' in buttonRequirement[i]) {
  //         return this.playerEvents.includes(buttonRequirement[i]['event']);
  //       } else if ('notEvent' in buttonRequirement[i]) {
  //         return !this.playerEvents.includes(buttonRequirement[i]['notEvent']);
  //       } else {
  //         return true;
  //       }
  //     }, this);
  //   }

  //   const xPadding = (width - 2 * buttonWidth) / 4, xLeft = buttonWidth / 2 + xPadding, xRight = width - buttonWidth / 2 - xPadding;
  //   const evenArrayLength = (validOptions.length % 2 == 0) ? validOptions.length : validOptions.length - 1;

  //   for (var i = 0; i < evenArrayLength; i++) {
  //     let button = new Button(this, (i % 2 == 0) ? xLeft : xRight, height - Math.floor(i / 2) * buttonHeight - 80, buttonText[validOptions[i]], buttonResponse[validOptions[i]], buttonItem[validOptions[i]], buttonEvent[validOptions[i]], buttonWidth);
  //     this.buttons.add(button);
  //   }
  //   if (validOptions.length == evenArrayLength + 1) {
  //     let button = new Button(this, width / 2, height - (evenArrayLength / 2) * buttonHeight - 80, buttonText[validOptions[i]], buttonResponse[validOptions[i]], buttonItem[validOptions[i]], buttonEvent[validOptions[i]], buttonWidth);
  //     this.buttons.add(button);
  //   }
  // }

  buttonTimer(duration) {
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1000 * duration,
      onUpdate: function (tween) {
        this.buttons.getChildren().forEach(function (button) {
          button.updateTimer(tween.getValue());
        });
      }.bind(this),
      onComplete: function () {
        this.getNextScene();
      }.bind(this)
    });

    let r = Phaser.Math.Between(0, this.buttons.getChildren().length - 1);
    this.updateActiveButton(this.buttons.getChildren()[r]);
  }

  updateActiveButton(activeButton) {
    this.buttons.getChildren().forEach(function (button) {
      if (button == activeButton) {
        button.displayTimer(true)
      } else {
        button.displayTimer(false)
      }
    });
  }

  getNextScene() {
    let nextSceneId, item, event;
    this.buttons.children.each(function (button) {
      if (button.isActive) {
        nextSceneId = button.response;
        item = button.getItem();
        event = button.getEvent();
      }
      button.destroy();
    });
    this.setScene(nextSceneId);
    if (item) this.addItem(item);  //playerItems.push(item);
    if (event) this.playerEvents.push(event);
  }

  setSongPercent(percent) {
    // Update scores to previous values, do nothing if time shifted forwards 
    const songTime = this.percentToSeconds(percent);
    this.song.seek = songTime;
  }

  percentToSeconds(percent) {
    return percent * this.song.totalDuration
  }

  getSongPercent() {
    return this.song.seek / this.song.totalDuration;
  }

  pauseGame() {
    this.song.pause();
  }

  resumeGame() {
    this.song.resume();
  }

  update(time, delta) {
    this.playerScene.updatePlayTime(this.song.seek, this.getSongPercent());
    this.moveBackground();
  }


}

class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, data, buttonWidth) {
    let background = scene.add.image(0, 0, 'button').setOrigin(0.5);
    let bitmapText = scene.add.bitmapText(0, 0, 'mont', data['text'], 20).setOrigin(0.5).setDropShadow(2, 2, 0x000000);

    background.setScale(buttonWidth / background.displayWidth);
    let timerBar = scene.add.rectangle(-background.displayWidth / 2, background.displayHeight / 2, 0, 10, 0xff0000).setOrigin(0);

    super(scene, x, y, [background, bitmapText, timerBar]);
    scene.add.existing(this);

    this.setSize(background.displayWidth, background.displayHeight);

    this.isActive = true;
    this.response = data['response'];
    this.item = data['item'] || '';
    this.event = data['event'] || '';

    this.setInteractive();
    this.on('pointerdown', () => {
      scene.updateActiveButton(this);
    }, this);
  }

  updateTimer(percent) {
    this.list[2].width = this.list[0].displayWidth * percent;
  }

  displayTimer(displayBool) {
    this.isActive = displayBool;
    this.list[2].setVisible(displayBool);
  }

  setActive() {
    this.displayTimer(true);
  }

  getItem() {
    return this.item;
  }

  getEvent() {
    return this.event;
  }
}

class DisplayItem {
  constructor(scene, x, y, width, item) {
    this.background = scene.add.image(x, y, 'button').setOrigin(0.5, 0);
    this.background.displayWidth = width;
    this.background.displayHeight = width;

    this.item = item;
    this.itemImage = scene.add.image(x, y, 'item').setOrigin(0.5, 0).setInteractive();
    this.itemImage.displayWidth = 0.9 * width;
    this.itemImage.displayHeight = 0.9 * width;

    // this.itemImage.on('pointerover', function (pointer) {
    //     console.log("The item is", this.item)

    // }.bind(this));

    // this.on('pointerout', function () {
    // }.bind(this));

    this.itemImage.on('pointerdown', function (pointer) {
      console.log("The item is", this.item)
    }, this)
  }

  setXPos(x) {
    this.background.x = x;
    this.itemImage.x = x;
  }

  setYPos(y) {
    this.background.y = y;
    this.itemImage.y = y;
  }
}