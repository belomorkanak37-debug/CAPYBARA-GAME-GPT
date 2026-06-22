# Капи Кафе: Merge Тайкун

HTML5/WebGL idle merge tycoon для Яндекс Игр. Проект собран на TypeScript, Phaser 3 и Vite.

## Стек

- TypeScript
- Phaser 3
- Vite
- Яндекс Игры SDK wrapper с mock-режимом для local/GitHub Pages
- localStorage + Yandex Player cloud save wrapper
- WebAudio procedural fallback для музыки, ambience и SFX
- GitHub Actions deploy в GitHub Pages

## Структура

```text
index.html
src/main.ts
src/game.ts
src/config/
src/scenes/
src/systems/
src/ui/
src/assets/
docs/yandex-games.md
.github/workflows/deploy.yml
```

## Локальный запуск

```bash
npm install
npm run dev
```

Обычно Vite откроется на:

```text
http://localhost:5173/
```

Локально игра запускается в mock-режиме без настоящего Yandex SDK.

## Проверка перед коммитом

```bash
npm install
npm run typecheck
npm run build
```

`npm run typecheck` запускает `tsc --noEmit`.

`npm run build` запускает TypeScript-проверку и production-сборку Vite.

## Preview production build

```bash
npm run build
npm run preview
```

Preview слушает `0.0.0.0`, чтобы можно было открыть игру с другого устройства в локальной сети.

## GitHub Pages

Workflow находится здесь:

```text
.github/workflows/deploy.yml
```

Он выполняет:

```bash
npm install --no-audit --no-fund
npm run typecheck
npm run build
```

и публикует папку:

```text
dist
```

Тестовая ссылка после успешного deploy:

```text
https://belomorkanak37-debug.github.io/CAPYBARA-GAME-GPT/
```

Для обхода кэша при проверке можно добавлять query-параметр:

```text
https://belomorkanak37-debug.github.io/CAPYBARA-GAME-GPT/?v=stage4
```

## Yandex Games SDK

В `index.html` стоит safe-loader:

- local/GitHub Pages: SDK не грузится, игра работает в mock-режиме;
- Yandex Games host: загружается `/sdk.js`;
- ручная проверка SDK-loader: добавить `?ysdk=1`.

Основной wrapper:

```text
src/systems/YandexSDK.ts
```

## Audio

Текущий аудио-слой:

```text
src/systems/AudioSystem.ts
```

Он использует WebAudio procedural fallback: каналы `music`, `ambient`, `ui`, `sfx`, fade при pause/resume, и unlock после первого действия пользователя. Целевой список реальных аудиофайлов описан здесь:

```text
src/assets/audio/README.md
```

## Сборка архива для Яндекс Игр

```bash
npm install
npm run typecheck
npm run build
cd dist
zip -r ../capi-cafe-yandex.zip .
```

В архиве `index.html` должен лежать в корне архива.

## В архив не включать

```text
src/
node_modules/
.github/
docs/
README.md
package.json
package-lock.json
tsconfig.json
vite.config.ts
```

## Минимальная ручная проверка

1. Открыть игру локально через `npm run dev`.
2. Нажать Play/Играть.
3. Купить работника.
4. Купить блюдо.
5. Смержить два одинаковых объекта.
6. Получить монеты от станции.
7. Проверить музыку/SFX после первого tap.
8. Отключить музыку и SFX в настройках.
9. Перезагрузить страницу и проверить сохранение.
10. Проверить GitHub Pages URL.
11. Проверить Console: нет красных ошибок.
12. В Яндекс Debug Panel проверить SDK init, LoadingAPI.ready, cloud save, rewarded ads и fullscreen ads.

## Текущий статус

Проект находится в стадии hardening. Выполнены этапы:

1. Блокеры Яндекс Игр и модерации: safe SDK loader, SDK fallback, recoverable saves, ad guards, listener cleanup.
2. Стабильность сборки и запуск: workflow запускает install, typecheck и build.
3. Визуальный polish: улучшены меню, HUD, кнопки, попапы, loading screen и базовая сцена кафе.
4. Аудио polish: WebAudio mixer, user-gesture unlock, channel volumes, fade, procedural music/ambience/SFX fallback и audio asset manifest.

Следующие этапы: монетизация/retention, производительность, финальная упаковка.
