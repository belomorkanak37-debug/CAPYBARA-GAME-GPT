export const gameConfig = {
  width: 720,
  height: 1280,
  safePadding: 22,
  saveKey: 'capi-cafe-save-v1',
  autosaveMs: 30_000,
  maxOfflineSeconds: 2 * 60 * 60,
  interstitialCooldownMs: 4 * 60 * 1000,
  colors: {
    background: '#F7D9A6',
    panel: '#FFF3D8',
    panelDark: '#D39A5E',
    text: '#5B3926',
    mint: '#9EE6C5',
    green: '#62C370',
    orange: '#F7A35C',
    caramel: '#D9914B',
    brown: '#8A5A34',
    gold: '#FFD15C',
    danger: '#E46C6C',
    white: '#FFFDF6'
  },
  slots: {
    workerStartX: 110,
    dishStartX: 110,
    workerY: 860,
    dishY: 1000,
    gap: 120,
    size: 92
  }
} as const;
