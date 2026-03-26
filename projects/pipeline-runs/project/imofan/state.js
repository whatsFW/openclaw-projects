// state.js — 全局状态（单一数据源）

export const state = {
  points: [],              // [{ x, y, visited }]
  pivot: null,             // { index, x, y } | null
  direction: 0,
  stepCount: 0,
  maxSteps: 200,
  maxPoints: 50,
  playbackState: 'IDLE',
  speedMultiplier: 3,
  balanceRange: null,

  stepAnim: {
    angleAtStart: 0,
    targetAngle: 0,
    elapsed: 0,
    duration: 0,
    hitIndex: -1
  },

  switchAnim: null,        // { phase, timer, oldPivot, newPivot }

  render: {
    arcFrom: 0,
    arcTo: 0,
    hitIndex: -1,
    areaPolygon: null
  }
};

export function resetState() {
  state.points = [];
  state.pivot = null;
  state.direction = 0;
  state.stepCount = 0;
  state.playbackState = 'IDLE';
  state.balanceRange = null;
  state.switchAnim = null;
  state.stepAnim = { angleAtStart: 0, targetAngle: 0, elapsed: 0, duration: 0, hitIndex: -1 };
  state.render = { arcFrom: 0, arcTo: 0, hitIndex: -1, areaPolygon: null };
}
