# Капи Кафе: Merge Тайкун

HTML5/WebGL idle merge tycoon для Яндекс Игр. Проект собран на TypeScript, Phaser 3 и Vite.

## Стек

- TypeScript
- Phaser 3
- Vite
- Яндекс Игры SDK wrapper с mock-режимом для local/GitHub Pages
- localStorage + Yandex Player cloud save wrapper
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
npm ci
npm run dev
```

Обычно Vite откроется на:

```text
http://localhost:5173/
```

Локально игра запускается в mock-режиме без настоящего Yandex SDK.

## Проверка перед коммитом

```bash
npm ci
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
npm ci
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
https://belomorkanak37-debug.github.io/CAPYBARA-GAME-GPT/?v=stage2
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

## Сборка архива для Яндекс Игр

```bash
npm ci
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
7. Перезагрузить страницу и проверить сохранение.
8. Проверить GitHub Pages URL.
9. Проверить Console: нет красных ошибок.
10. В Яндекс Debug Panel проверить SDK init, LoadingAPI.ready, cloud save, rewarded ads и fullscreen ads.

## Текущий статус

Проект находится в стадии hardening. Выполнены этапы:

1. Блокеры Яндекс Игр и модерации: safe SDK loader, SDK fallback, recoverable saves, ad guards, listener cleanup.
2. Стабильность сборки и запуск: package-lock, `npm ci`, `typecheck`, обновлённый Pages workflow.

Следующие этапы: визуальный polish, аудио polish, монетизация/retention, производительность, финальная упаковка.
