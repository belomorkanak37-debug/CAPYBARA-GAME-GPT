import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { ShopScene } from './scenes/ShopScene';
import { TutorialScene } from './scenes/TutorialScene';
import { audio } from './systems/AudioSystem';

export function createGame(): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: gameConfig.colors.background,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: gameConfig.width,
      height: gameConfig.height
    },
    input: { activePointers: 3 },
    render: { antialias: true, pixelArt: false, roundPixels: true },
    scene: [BootScene, PreloadScene, MainMenuScene, GameScene, UIScene, ShopScene, TutorialScene]
  };

  window.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
  setupAudioUnlock();

  return new Phaser.Game(config);
}

function setupAudioUnlock(): void {
  const unlock = () => {
    void audio.unlock();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });
}
