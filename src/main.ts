import './style.css';
import { createGame } from './game';
import { yandexSDK } from './systems/YandexSDK';

void yandexSDK.init().finally(() => {
  createGame();
});
