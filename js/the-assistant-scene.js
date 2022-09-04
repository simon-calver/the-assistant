export default class TheAssistantScene extends Phaser.Scene {

  constructor() {
    super('TheAssistantScene');
  }

  preload() {
    // Audio
    this.load.audio('promises', 'assets/audio/the-assistant.mp3', { stream: true }); // What does stream do??????
  }

  create(params = { 'pauseAtStart': true, 'muteSong': false, 'firstGame': false }) {
  }
}