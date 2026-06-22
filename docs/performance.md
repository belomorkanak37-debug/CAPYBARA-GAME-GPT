# Performance budget

Stage 6 adds lightweight performance hardening for the current Phaser prototype.

## Runtime targets

| Metric | Target |
|---|---:|
| Target FPS | 60 FPS |
| Minimum acceptable FPS | 30 FPS |
| Active display objects on gameplay screen | under 140 |
| Burst particles per effect | 14 max |
| Pooled coin texts | 12 |
| Pooled burst dots | 56 |
| Autosave cadence | 30 seconds plus throttled action saves |
| Action save debounce | 1200 ms |
| First playable target | under 3 seconds on mid Android |

## Implemented optimizations

- Coin fly texts are pooled in `FxPool` instead of created/destroyed every income tick.
- Merge / upgrade burst dots are pooled in `FxPool` instead of created/destroyed per burst.
- Action saves go through `SaveScheduler`, which debounces frequent save requests.
- Autosave and visibility loss still force a save flush, preserving idle income.
- Visitor placeholder was replaced with an object-pool-ready `VisitorSystem`.
- Game scene listeners are removed on shutdown/destroy.

## Still to do before final release

- Replace procedural shape art with atlases to reduce draw calls.
- Move station and slot rendering to reusable containers instead of rebuilding the full scene after zone unlock.
- Add real object pooling for visitor movement when visitor gameplay becomes active.
- Add a debug performance overlay for FPS and active object count.
- Profile on Android Chrome and iOS Safari.

## Manual performance test

1. Open the GitHub Pages build on a phone.
2. Play for 5 minutes.
3. Buy multiple workers and dishes.
4. Trigger 10+ merge bursts.
5. Open and close the shop repeatedly.
6. Background/foreground the tab.
7. Confirm no visible stutter, no console errors and progress is saved.
