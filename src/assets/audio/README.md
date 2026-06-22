# Audio assets

Stage 4 currently uses a WebAudio procedural fallback in `src/systems/AudioSystem.ts` so the game has safe music, ambience and SFX without external binary assets.

Replace the procedural fallback with real compressed audio before final release.

## Target files

| File | Type | Target loudness / volume | Usage |
|---|---|---:|---|
| `music_cafe_loop.ogg` + `music_cafe_loop.mp3` | loop music | about -18 LUFS, runtime volume 0.32 | main menu and game |
| `ambience_cafe.ogg` + `ambience_cafe.mp3` | loop ambience | about -24 LUFS, runtime volume 0.16 | game background |
| `sfx_click.ogg` | UI SFX | runtime volume 0.52 | all buttons |
| `sfx_coin.ogg` | SFX | runtime volume 0.62 | coin income |
| `sfx_merge.ogg` | SFX | runtime volume 0.62 | successful merge |
| `sfx_upgrade.ogg` | SFX | runtime volume 0.62 | station upgrade and item purchase |
| `sfx_reward.ogg` | SFX | runtime volume 0.62 | quests and rewards |
| `sfx_error.ogg` | UI/SFX | runtime volume 0.45 | failed action |

## Requirements

- Keep total audio under 2-4 MB for the first public build.
- Use short SFX, 0.05-0.5 seconds each.
- Music and ambience must loop cleanly with no click at the loop point.
- Audio must stay muted when the user disables music or SFX.
- Audio must pause during ads and on page visibility loss.
- Audio must unlock only after the first user gesture.
