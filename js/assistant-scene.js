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

    // For testing that the loading screen works
    // for (var i = 0; i < 50; i++) {
    //   this.load.image(`light_${i}`, 'assets/images/backgrounds/light.png');
    // }

    // Game assets
    // this.load.image('black-hole', 'assets/sprites/black-hole.png');
    // this.load.image('ball', 'assets/sprites/ball.png');
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

    this.buttons = this.add.group({ classType: Button });
    this.displayText = this.add.bitmapText(width / 2, 120, 'mont', '', 26).setCenterAlign().setOrigin(0.5).setTint('k');

    this.storyText = this.cache.json.get('story-text');

    this.playerItems = [];
    this.playerEvents = [];
    this.setScene('start');



    let background = this.add.image(width / 2, height / 2, 'button').setOrigin(0.5).setInteractive();
    background.on('pointerdown', () => {
      console.log(this.playerItems)
    });




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


    // this.origin = new Phaser.Math.Vector2(width / 2, height / 2 - 50);

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
    // if (params['muteSong']) {
    //   this.song.setVolume(0);
    //   this.updateGameScore(-20, 2, false);
    // }

    // // Spawn the shapes!
    // this.spawnAngle = 0;
    // this.spawnIndex = 0;
    // this.spawnTimer = this.time.addEvent({
    //   delay: 1678,
    //   loop: true,
    //   callback: this.spawnShape,
    //   callbackScope: this
    // }, this);
  }

  setScene(sceneId) {
    console.log('Next scene: ', sceneId);
    // console.log(this.storyText[sceneId])
    this.displayText.text = this.storyText[sceneId]['storyText']
    this.addButtons(this.storyText[sceneId]['options']); //['buttonText'], this.storyText[sceneId]['buttonResponse'], this.storyText[sceneId]['item']);
    this.buttonTimer(this.storyText[sceneId]['duration']);
  }

  addButtons(options) {
    let { width, height } = this.sys.game.canvas;
    const buttonWidth = 140, buttonHeight = 60;

    console.log(options)
    options = this.getValidOptions(options);
    console.log(options)

    const xPadding = (width - 2 * buttonWidth) / 4, xLeft = buttonWidth / 2 + xPadding, xRight = width - buttonWidth / 2 - xPadding;

    options.forEach((option, index) => {
      let button;
      if (index % 2 == 0 & index == options.length - 1) {
        button = new Button(this, width / 2, height - (index / 2) * buttonHeight - 80, option, buttonWidth);
      } else {
        button = new Button(this, (index % 2 == 0) ? xLeft : xRight, height - Math.floor(index / 2) * buttonHeight - 80, option, buttonWidth);
      }
      this.buttons.add(button);
    })

    // for (const [])
    // const evenArrayLength = (options.length % 2 == 0) ? options.length : options.length - 1;

    // for (var i = 0; i < evenArrayLength; i++) {
    //   let button = new Button(this, (i % 2 == 0) ? xLeft : xRight, height - Math.floor(i / 2) * buttonHeight - 80, options[i], buttonWidth);
    //   this.buttons.add(button);
    // }
    // if (options.length == evenArrayLength + 1) {
    //   let button = new Button(this, width / 2, height - (evenArrayLength / 2) * buttonHeight - 80, options[i], buttonWidth);
    //   this.buttons.add(button);
    // }


    // console.log(buttons);
    // const buttonText = sceneJson['buttonText'];
    // const buttonResponse = sceneJson['buttonResponse'];
    // const buttonItem = sceneJson['item'] ? sceneJson['item'] : Array.from({ length: buttonResponse.length }, () => '');
    // const buttonEvent = sceneJson['event'] ? sceneJson['event'] : Array.from({ length: buttonResponse.length }, () => '');
    // const buttonRequirement = sceneJson['requirement'];

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

    // const xPadding = (width - 2 * buttonWidth) / 4, xLeft = buttonWidth / 2 + xPadding, xRight = width - buttonWidth / 2 - xPadding;
    // const evenArrayLength = (validOptions.length % 2 == 0) ? validOptions.length : validOptions.length - 1;

    // for (var i = 0; i < evenArrayLength; i++) {
    //   let button = new Button(this, (i % 2 == 0) ? xLeft : xRight, height - Math.floor(i / 2) * buttonHeight - 80, buttonText[validOptions[i]], buttonResponse[validOptions[i]], buttonItem[validOptions[i]], buttonEvent[validOptions[i]], buttonWidth);
    //   this.buttons.add(button);
    // }
    // if (validOptions.length == evenArrayLength + 1) {
    //   let button = new Button(this, width / 2, height - (evenArrayLength / 2) * buttonHeight - 80, buttonText[validOptions[i]], buttonResponse[validOptions[i]], buttonItem[validOptions[i]], buttonEvent[validOptions[i]], buttonWidth);
    //   this.buttons.add(button);
    // }
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
    if (item) this.playerItems.push(item);
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