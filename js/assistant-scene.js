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
    this.load.image('graveyardArm', 'assets/sprites/graveyardArm.png');

    this.load.image('speech', 'assets/sprites/speech.png');

    // For testing that the loading screen works
    // for (var i = 0; i < 50; i++) {
    //   this.load.image(`light_${i}`, 'assets/images/backgrounds/light.png');
    // }

    // Game assets
    // this.load.image('black-hole', 'assets/sprites/black-hole.png');
    this.load.image('item', 'assets/sprites/ball.png');
    // this.load.atlas('star', 'assets/sprites/star.png', 'assets/sprites/star.json');
    this.load.atlas('items', 'assets/sprites/items.png', 'assets/sprites/items.json');

    // JSON files
    this.load.json('story-text', 'assets/json/story-text.json');
  }

  create(params = { 'pauseAtStart': true, 'muteSong': false, 'firstGame': false }) {
    // this.input.setDefaultCursor('url(assets/cursors/hand.cur), pointer');

    // I don't want the canvas to fill the screen on desktop, so set default size. This should only affect the 
    // aspect ratio since it is using scale.FIT
    if (this.sys.game.device.os.desktop) {
      this.scale.setGameSize(380, 720);
    }
    // get this after resizing, obviously
    let { width, height } = this.sys.game.canvas;

    this.backgroundOrigin = new Phaser.Math.Vector2(width / 2, height - 30);
    this.origin = new Phaser.Math.Vector2(width / 2, height / 2);
    this.addDefaultBackgrounds();

    this.buttons = this.add.group({ classType: Button });
    this.textBackground = this.add.rectangle(width / 2, 0, width, 40, 0x85817f).setOrigin(0.5, 0).setAlpha(0.6);

    // this.add.image(width / 2, 40, 'text_background').setOrigin(0.5, 0).setScale(1.2);
    this.displayText = this.add.bitmapText(width / 2, 0, 'mont', '', 26).setCenterAlign().setOrigin(0.5, 0).setTint('w');
    this.displayText.setMaxWidth(width - 20);

    this.speechBubbles = [];

    this.addMapButton();
    this.addFastForwardButton();
    // this.add.bitmapText(width / 2, 50, 'mont', 'Items', 18).setCenterAlign().setOrigin(0.5, 0).setTint('k');
    // this.add.bitmapText(width / 2, 140, 'mont', 'Other', 18).setCenterAlign().setOrigin(0.5, 0).setTint('k');

    // ONly makie visiblbe when have items
    // this.addItemsMenu();

    this.storyText = this.cache.json.get('story-text');

    this.playerItems = [];
    this.playerCollectibles = [];
    this.playerEvents = []; // Make these sets?
    this.playerStates = [];
    this.setScene('outskirts'); //intro');


    this.displayItems = [];


    window.addEventListener('deviceorientation', this.handleOrientation, true);


    // window.addEventListener("click", function () {
    //   console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    // });


    // this.paralax();


    // Hard code this for now, maybe add to json?
    this.events = { "sceneName": { "start": 99, "triggered": false } };

    this.addItem('axe');
    this.addItem('money');
    this.addItem('shovel');
    this.addItem('medallion');

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
    // this.song.seek = 50;
  }

  handleOrientation(e) {
    const x = e.gamma;
    const y = e.beta;

    if (this.displayText) {
      this.displayText.text = `x=${x}`;
    }
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
    if (item.includes('Arm') | item.includes('Leg') | item.includes('Torso') | item.includes('Brain') | item.includes('Organs')) {
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

  removeItem(item) {
    const itemIndex = this.displayItems.findIndex(displayItem => displayItem.getItem() == item);
    this.displayItems[itemIndex].destroy();
    this.displayItems.splice(itemIndex, 1);
    if (item.includes('Arm') | item.includes('Leg') | item.includes('Torso') | item.includes('Brain') | item.includes('Organs')) {
      const itemIndex = this.playerCollectibles.findIndex(collectible => collectible == item);
      this.playerCollectibles.splice(itemIndex, 1);
    } else {
      const itemIndex = this.playerItems.findIndex(collectible => collectible == item);
      this.playerItems.splice(itemIndex, 1);
    }
    this.resetItemDisplay();
  }

  // removeItem(item) {
  //   if (item.includes('Arm') | item.includes('Leg') | item.includes('Torso') | item.includes('Brain') | item.includes('Organs')) {
  //     const itemIndex = this.playerCollectibles.findIndex(collectible => collectible == item);
  //     this.playerCollectibles.splice(itemIndex, 1);
  //   } else {
  //     const itemIndex = this.playerItems.findIndex(collectible => collectible == item);
  //     this.playerItems.splice(itemIndex, 1);
  //   }
  //   this.resetItemDisplay();
  // }

  resetItemDisplay() {
  }

  //   let { width, height } = this.sys.game.canvas;
  //   const itemWidth = 40;
  //   let displayX;
  //   let displayY;

  //   for (var item of this.playerItems) {

  //   }


  //   if (item.includes('Arm') | item.includes('Leg') | item.includes('Torso') | item.includes('Brain') | item.includes('Organs')) {
  //     this.playerCollectibles.push(item);
  //     displayX = width - itemWidth / 2 - 2;
  //     displayY = this.playerCollectibles.length * (itemWidth + 5)
  //   } else {
  //     this.playerItems.push(item);
  //     displayX = itemWidth / 2 + 2;
  //     displayY = this.playerItems.length * (itemWidth + 5)
  //   }

  //   // const itemsLen = this.displayItems.length;
  //   this.displayItems.push(new DisplayItem(this, displayX, displayY + 160, itemWidth, item));
  // }

  setScene(sceneId) {
    console.log('Next scene: ', sceneId);
    if (this.storyText[sceneId]['text']) {
      this.updateBackground(this.storyText[sceneId]['backgrounds']);

      let text = '';
      let options = [];
      for (var storyEvent of this.storyText[sceneId]['text']) {
        if (this.checkRequirements(storyEvent['requirements'])) {
          text += storyEvent['story'] ? storyEvent['story'] : '';
          if (storyEvent['items']) {
            for (var item of storyEvent['items']) {
              this.addItem(item);
            }
          }
          if (storyEvent['events']) {
            for (var event of storyEvent['events']) {
              this.playerEvents.push(event);
            }
          }
          if (storyEvent['options']) {
            options = options.concat(storyEvent['options']);
          }
          console.log(options);
          // What if there are multiple of these? show in order with delay? Assume there will be one, maybe do speech separate in json
          if (storyEvent['speechBubble']) {
            this.speechBubbles.push(new SpeechBubble(this, storyEvent['speechBubble']));
          }
        }
      }
      this.displayText.text = text;


      let displayMapButton = true;
      if (this.storyText[sceneId]['mapButton'] != undefined) {
        displayMapButton = this.storyText[sceneId]['mapButton'];
      }
      this.addButtons(options, displayMapButton);

      // this.addButtons(this.storyText[sceneId]['options'], displayMapButton);


    } else {
      this.updateBackground(this.storyText[sceneId]['backgrounds']);
      let displayMapButton = true;
      if (this.storyText[sceneId]['mapButton'] != undefined) {
        displayMapButton = this.storyText[sceneId]['mapButton'];
      }
      if (this.storyText[sceneId]['item']) {
        this.addItem(this.storyText[sceneId]['item']);
      }
      if (this.storyText[sceneId]['story']) {
        let storyEvent = this.getStoryEvent(this.storyText[sceneId]['story']);
        // console.log(storyEvent);
        this.displayText.text = storyEvent['storyText'];
        // Make all of these lists !!!!
        if (storyEvent['speechBubble']) {
          this.speechBubbles.push(new SpeechBubble(this, storyEvent['speechBubble']));
        }
        if (storyEvent['item']) {
          this.addItem(storyEvent['item']);
        }
        if (storyEvent['items']) {
          for (var item of storyEvent['items']) {
            this.addItem(item);
          }
        }
        if (storyEvent['event']) {
          this.playerEvents.push(storyEvent['event']);
        }
        if (storyEvent['events']) {
          for (var event of storyEvent['events']) {
            this.playerEvents.push(event);
          }
        }
        if (storyEvent['options']) {
          this.addButtons(storyEvent['options'], displayMapButton);
        } else {
          this.addButtons(this.storyText[sceneId]['options'], displayMapButton);
        }
        // this.displayText.text = this.getText(this.storyText[sceneId]['story']);
      } else {
        this.displayText.text = this.storyText[sceneId]['storyText'];
        this.addButtons(this.storyText[sceneId]['options'], displayMapButton);
      }

    }
    // console.log(this.storyText[sceneId]['item']);
    this.textBackground.displayHeight = this.displayText.height;// + 5;
    // console.log(this.displayText.getTextBounds()); //['buttonText'], this.storyText[sceneId]['buttonResponse'], this.storyText[sceneId]['item']);
    this.buttonTimer(this.storyText[sceneId]['duration']);
    // this.paralax();

    console.log("Player events: ", this.playerEvents);
  }


  checkRequirements(reqs) {
    if (reqs) {
      let valid;
      for (var req of reqs) {
        // console.log(req);
        // console.log(valid)
        let reqValid = this.checkRequirement(req);
        // console.log(reqValid)
        if (valid == null) {
          valid = reqValid;
        } else {
          // Check which operation to use (i.e. and or or), default is &
          if (req['op'] != undefined & req['op'] == 'OR') {
            valid = valid | reqValid;
          } else {
            valid = valid & reqValid;
          }
        }
      }

      return valid;
    } else {
      return true;
    }
  }

  checkRequirementsOLD(reqs) {
    if (reqs) {
      let valid = true;
      // Require all conditions to be true
      for (var req of reqs) {
        if ('item' in req) {
          valid = valid & this.playerItems.includes(req['item']);
        } else if ('notItem' in req) {
          valid = valid & !this.playerItems.includes(req['notItem']);
        } else if ('event' in req) {
          valid = valid & this.playerEvents.includes(req['event']);
        } else if ('notEvent' in req) {
          valid = valid & !this.playerEvents.includes(req['notEvent']);
        } else if ('time' in req) {
          // This check is probably only neccesary for testing
          if (this.song) {
            valid = valid & this.song.seek >= req['time'][0] & this.song.seek < req['time'][1];
          }
        } else if ('notTime' in req) {
          // This check is probably only neccesary for testing
          if (this.song) {
            valid = valid & !(this.song.seek >= req['notTime'][0] & this.song.seek < req['notTime'][1]);
          }
        }
      }
      return valid;
    } else {
      return true;
    }
  }

  checkRequirement(req) {
    let valid = false;
    if ('item' in req) {
      valid = this.playerItems.includes(req['item']) | this.playerCollectibles.includes(req['item']);
    } else if ('event' in req) {
      valid = this.playerEvents.includes(req['event']);
    } else if ('time' in req) {
      // This check is probably only neccesary for testing
      if (this.song) {
        // console.log(this.song.seek)
        valid = Boolean(this.song.seek >= req['time'][0] & this.song.seek < req['time'][1]);
      }
    } else if ('state' in req) {
      valid = this.playerStates.includes(req['state']);
    }

    // Check if this is negated
    // console.log(req['cond'])
    if (req['cond'] != undefined & req['cond'] == 'not') {
      // console.log('its nort')
      return !valid;
    } else {
      return valid;
    }
  }

  addButtons(options, displayMapButton) {
    let { width, height } = this.sys.game.canvas;
    const buttonWidth = 140, buttonHeight = 60; // width 140 try bigger??

    const centre = displayMapButton ? width / 2 + 30 : width / 2;
    width = displayMapButton ? width - 55 : width;

    const xPadding = (width - 2 * buttonWidth) / 4, xLeft = centre - buttonWidth / 2 - xPadding, xRight = centre + buttonWidth / 2 + xPadding;
    const startHeight = 90;

    options = this.getValidOptions(options);

    if (displayMapButton) {
      this.updateMapButton(height - Math.ceil(options.length / 2) / 2 * buttonHeight - 50);
    } else {
      this.displayMapButton(false);
    }
    options.forEach((option, index) => {
      let button;
      if (index % 2 == 0 & index == options.length - 1) {
        button = new Button(this, centre, height - (index / 2) * buttonHeight - startHeight, option, buttonWidth);
      } else {
        button = new Button(this, (index % 2 == 0) ? xLeft : xRight, height - Math.floor(index / 2) * buttonHeight - startHeight, option, buttonWidth);
      }
      this.buttons.add(button);
    });
  }

  // For testing only
  addFastForwardButton() {
    let fastForward = this.add.image(20, 200, 'button').setOrigin(0, 0.5);
    fastForward.displayWidth = 45;
    fastForward.displayHeight = 45;
    fastForward.setInteractive();
    fastForward.on('pointerdown', () => {
      this.buttonTween.stop();
      this.getNextScene()
    }, this);
  }

  addMapButton() {
    this.mapButton = this.add.image(10, 50, 'button').setOrigin(0, 0.5);
    this.mapButton.displayWidth = 45;
    this.mapButton.displayHeight = 45;
    this.mapButton.setInteractive();
    this.mapButton.on('pointerdown', () => {
      this.stopCurrentScene();
      this.setScene('outskirts');
    }, this);
    this.displayMapButton(false);
  }

  updateMapButton(yPos) {
    this.mapButton.y = yPos;
    this.displayMapButton(true);
  }

  displayMapButton(visible) {
    this.mapButton.setVisible(visible);
  }

  addDefaultBackgrounds() {
    // let { width, height } = this.sys.game.canvas;
    let background = this.add.image(this.backgroundOrigin.x, this.backgroundOrigin.y, 'default_background').setOrigin(0.5, 1).setScale(1.1);
    let midground = this.add.image(this.backgroundOrigin.x, this.backgroundOrigin.y, 'default_midground').setOrigin(0.5, 1).setScale(1.1);
    let foreground = this.add.image(this.backgroundOrigin.x, this.backgroundOrigin.y, 'default_foreground').setOrigin(0.5, 1).setScale(1.1);

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

  // getText(textOptions) {
  //   let validText = textOptions.filter(function (text) {
  //     const req = text['requirement']
  //     if (req) {
  //       if ('item' in req) {
  //         return this.playerItems.includes(req['item']);
  //       } else if ('event' in req) {
  //         return this.playerEvents.includes(req['event']);
  //       } else if ('notEvent' in req) {
  //         return !this.playerEvents.includes(req['notEvent']);
  //       } else {
  //         return true;
  //       }
  //     } else {
  //       return true;
  //     }
  //   }, this);
  //   return validOptions;
  // }
  getStoryEvent(storyEvents) {
    console.log(storyEvents);
    let event = this.getValidOptions(storyEvents);

    if (event.length > 1) {
      console.log('Too many text options!');
    }
    return event[0];
  }

  getValidOptions(options) {
    let validOptions = options.filter(function (option) {
      const reqs = option['requirements']
      if (reqs) {
        return this.checkRequirements(reqs);
        // let valid = true;
        // // Require all conditions to be true
        // for (var req of reqs) {
        //   if ('item' in req) {
        //     valid = valid & this.playerItems.includes(req['item']);
        //   } else if ('event' in req) {
        //     valid = valid & this.playerEvents.includes(req['event']);
        //   } else if ('notEvent' in req) {
        //     valid = valid & !this.playerEvents.includes(req['notEvent']);
        //   } else if ('time' in req) {
        //     // This check is probably only neccesary for testing
        //     if (this.song) {
        //       valid = valid & this.song.seek >= req['time'][0] & this.song.seek < req['time'][1];
        //     }
        //   } else if ('notTime' in req) {
        //     // This check is probably only neccesary for testing
        //     if (this.song) {
        //       valid = valid & !(this.song.seek >= req['notTime'][0] & this.song.seek < req['notTime'][1]);
        //     }
        //   }
        // }
        // return valid;
      } else {
        return true;
      }
    }, this);
    return validOptions;
  }

  // checkRequirement(req) {
  //   let valid = false;
  //   if ('item' in req) {
  //     valid = this.playerItems.includes(req['item']);
  //   } else if ('event' in req) {
  //     valid = this.playerEvents.includes(req['event']);
  //   } else if ('time' in req) {
  //     // This check is probably only neccesary for testing
  //     if (this.song) {
  //       // console.log(this.song.seek)
  //       valid = Boolean(this.song.seek >= req['time'][0] & this.song.seek < req['time'][1]);
  //     }
  //   }

  //   // Check if this is negated
  //   // console.log(req['cond'])
  //   if (req['cond'] != undefined & req['cond'] == 'not') {
  //     // console.log('its nort')
  //     return !valid;
  //   } else {
  //     return valid;
  //   }
  // }

  // checkRequirement(req) {
  //   let valid = false;
  //   if ('item' in req) {
  //     valid = this.playerItems.includes(req['item']);
  //   } else if ('event' in req) {
  //     valid = this.playerEvents.includes(req['event']);
  //   } else if ('time' in req) {
  //     // This check is probably only neccesary for testing
  //     if (this.song) {
  //       // console.log(this.song.seek)
  //       valid = Boolean(this.song.seek >= req['time'][0] & this.song.seek < req['time'][1]);
  //     }
  //   }

  //   // Check if this is negated
  //   // console.log(req['cond'])
  //   if (req['cond'] != undefined & req['cond'] == 'not') {
  //     // console.log('its nort')
  //     return !valid;
  //   } else {
  //     return valid;
  //   }
  // }

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
    this.buttonTween = this.tweens.addCounter({
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
    // Reset player states before each turn 
    this.playerStates = [];

    let nextSceneId, items, events, cost, states;
    // Get items/events from buttons then delete them
    this.buttons.children.each(function (button) {
      if (button.isActive) {
        nextSceneId = button.response;
        items = button.getItems();
        events = button.getEvents();
        cost = button.getCost();
        states = button.getStates();
      }
      button.destroy();
    });
    // if (data['events']) {
    //   this.event = data['events'];
    // }
    for (var item of items) {
      this.addItem(item);
    }
    for (var event of events) {
      this.playerEvents.push(event);
    }
    for (var itemCost of cost) {
      this.removeItem(itemCost);
    }
    for (var state of states) {
      this.playerStates.push(state);
    }
    // if (event) this.playerEvents.push(event);

    // Delete all speech bubbles, there should probably only ever be one or zero in this array
    this.speechBubbles.forEach((speechBubble) => {
      speechBubble.destroy();
    });
    this.speechBubbles = [];

    // Check for player states
    this.updatePlayerStates();

    this.setScene(nextSceneId);
  }

  updatePlayerStates() {
    const weaponItems = ['shovel', 'axe'];
    if (weaponItems.some(item => this.playerItems.includes(item))) {
      this.playerStates.push('hasWeapon');
    }
  }

  stopCurrentScene() {
    this.buttons.children.each(function (button) {
      button.destroy();
    });
    this.buttonTween.stop();
    this.speechBubbles.forEach((speechBubble) => {
      speechBubble.destroy();
    });
    this.speechBubbles = [];
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
    this.checkForEvent();
  }

  checkForEvent() {
    // check json? a bit slow? put conditions first?
    if (this.song.seek > 99 & !this.events['sceneName']['triggered']) {
      this.events['sceneName']['triggered'] = true;
      this.stopCurrentScene()
      this.setScene('frankensteinMiddle');
      // console.log("WWWWWWWWWWWWWWWWW");
    }

  }

}

class SpeechBubble {//} extends Phaser.GameObjects.Container {
  constructor(scene, data) {
    let { width, height } = scene.sys.game.canvas;
    const maxWidth = width / 2;

    const xPos = width / 2 - maxWidth / 2 + 20;
    const yPos = height / 2 - 100;
    // Would need to use mask for this to work or use alpha=1
    // this.aa = scene.add.image(xPos, yPos, 'speech').setOrigin(0.5, 0).setScale(1.2);
    this.background = scene.add.circle(xPos, yPos, 20, 0x85817f).setAlpha(0.6);

    this.bitmapText = scene.add.bitmapText(xPos, yPos, 'mont', '\"' + data['text'] + '\"', 20).setOrigin(0.5).setTint('k').setCenterAlign();
    this.bitmapText.setMaxWidth(maxWidth);

    // Phaser.Display.Align.In.Center(this.bitmapText, this.background);

    this.background.displayWidth = this.bitmapText.width + 60;
    this.background.displayHeight = this.bitmapText.height + 20;

    this.showCharacter(scene, data['image'])
    // scene.add.existing(this.background);
    // console.log(data);
  }

  showCharacter(scene, texture) {
    let { width, height } = scene.sys.game.canvas;
    const characterHeight = 3 * height / 4;

    this.character = scene.add.image(width / 2 + 80, height + 40).setOrigin(0.5, 1);

    if (scene.textures.exists(texture)) {
      this.character.setTexture(texture);
      this.character.setScale(characterHeight / this.character.displayHeight);
    } else {
      scene.load.image(texture, `assets/images/characters/${texture}`);
      scene.load.start();
      scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        this.character.setTexture(texture);
        this.character.setScale(characterHeight / this.character.displayHeight);
      });
    }
  }

  destroy() {
    this.background.destroy();
    this.bitmapText.destroy();
    this.character.destroy();
  }


  // updateBackground(backgrounds) {
  //   backgrounds = backgrounds ? backgrounds : {};
  //   let keys = ["background", "midground", "foreground"];
  //   keys.forEach(function (key, i) {
  //     let texture = backgrounds[key] ? backgrounds[key] : `default_${key}`;
  //     if (this.textures.exists(texture)) {
  //       this.backgrounds[i].setTexture(texture);
  //     } else {
  //       this.load.image(texture, `assets/images/backgrounds/${texture}`);
  //       this.load.start();
  //       this.load.once(Phaser.Loader.Events.COMPLETE, () => {
  //         this.backgrounds[i].setTexture(texture);
  //       });
  //     }
  //   }, this);

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
    this.items = data['items'] || [];
    this.events = data['events'] || [];
    this.cost = data['cost'] || [];
    this.states = data['states'] || [];

    // Make this all events!!
    // if (data['events']) {
    //   this.event = data['events'];
    // }
    // if (data['items']) {
    //   this.item = data['items'];
    // }

    this.setInteractive();
    this.on('pointerdown', () => {
      scene.updateActiveButton(this);
    }, this);

    // This seems a little dangerous!!!
    while (bitmapText.width > buttonWidth - 5) {
      bitmapText.setFontSize(bitmapText.fontSize - 1);
    }
    // for (let i = 0; i < 10; i++) {
    //   bitmapText.setFontSize(bitmapText.fontSize - 1);
    //   console.log(bitmapText.width / bitmapText.fontSize);
    // }
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

  getItems() {
    return this.items;
  }

  getEvents() {
    return this.events;
  }

  getCost() {
    return this.cost;
  }

  getStates() {
    return this.states;
  }
}

class DisplayItem {
  constructor(scene, x, y, width, item) {
    this.background = scene.add.image(x, y, 'button').setOrigin(0.5, 0);
    this.background.displayWidth = width;
    this.background.displayHeight = width;

    this.item = item;
    if (scene.textures.exists('items', `${item}.png`)) {
      this.itemImage = scene.add.image(x, y, 'items', `${item}.png`).setOrigin(0.5, 0).setInteractive();
    } else {
      this.itemImage = scene.add.image(x, y, 'item').setOrigin(0.5, 0).setInteractive();
    }
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

  getItem() {
    return this.item;
  }

  destroy() {
    this.background.destroy();
    this.itemImage.destroy();
  }
}