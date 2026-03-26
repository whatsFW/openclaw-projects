// animation.js — rAF + ease-in-out + 播放状态机 + 支点切换子状态机

import { state } from './state.js';
import { findClockwiseNearest } from './geometry.js';

const BASE_SPEED = 1.2;
const SWITCH_DUR = { HIT_PULSE: 0.2, OLD_FADE: 0.15, NEW_RISE: 0.15 };

export function start() {
  if (state.points.length < 3 || !state.pivot) return;
  state.playbackState = 'RUNNING';
  prepareNextHit();
}

export function pause() {
  if (state.playbackState === 'RUNNING') state.playbackState = 'PAUSED';
}

export function resume() {
  if (state.playbackState === 'PAUSED') state.playbackState = 'RUNNING';
}

export function singleStep() {
  if (state.playbackState === 'RUNNING') return;
  if (!state.pivot || state.stepCount >= state.maxSteps) return;
  executeStep();
}

export function reset() {
  state.pivot = null; state.direction = 0; state.stepCount = 0;
  state.playbackState = 'IDLE'; state.switchAnim = null; state.balanceRange = null;
  state.stepAnim = { angleAtStart: 0, targetAngle: 0, elapsed: 0, duration: 0, hitIndex: -1 };
  state.render = { arcFrom: 0, arcTo: 0, hitIndex: -1, areaPolygon: null };
  for (const p of state.points) { p.visited = false; }
}

export function clearAll() { reset(); state.points = []; }

function prepareNextHit() {
  if (!state.pivot) return;
  const result = findClockwiseNearest(state.pivot.index, state.direction, state.points);
  if (!result) { state.playbackState = 'PAUSED'; return; }

  let hitAngle = result.hitAngle;
  while (hitAngle <= state.direction) hitAngle += 2 * Math.PI;

  const angDist = hitAngle - state.direction;
  const speed = BASE_SPEED * state.speedMultiplier;

  state.stepAnim = {
    angleAtStart: state.direction,
    targetAngle: hitAngle,
    elapsed: 0,
    duration: Math.max(angDist / speed, 0.05),
    hitIndex: result.hitIndex
  };
  state.render.hitIndex = result.hitIndex;
  state.render.arcFrom = state.direction;
  state.render.arcTo = result.hitAngle;
}

function executeStep() {
  const result = findClockwiseNearest(state.pivot.index, state.direction, state.points);
  if (!result) { state.playbackState = 'PAUSED'; return; }

  state.direction = result.hitAngle;
  state.points[state.pivot.index].visited = true;
  state.switchAnim = { phase: 'HIT_PULSE', timer: 0, oldPivot: state.pivot.index, newPivot: result.hitIndex };
}

function finishSwitch(anim) {
  const idx = anim.newPivot;
  state.pivot = { index: idx, x: state.points[idx].x, y: state.points[idx].y };
  state.switchAnim = null;
  prepareNextHit();
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function tick(dt) {
  // 1. 支点切换冻结旋转
  if (state.switchAnim) {
    const a = state.switchAnim;
    a.timer += dt;
    const phaseDur = SWITCH_DUR[a.phase];
    a.progress = Math.min(a.timer / phaseDur, 1);
    if (a.timer >= phaseDur) {
      a.timer = 0;
      if (a.phase === 'HIT_PULSE') a.phase = 'OLD_FADE';
      else if (a.phase === 'OLD_FADE') a.phase = 'NEW_RISE';
      else finishSwitch(a);
    }
    return;
  }

  // 2. 非 RUNNING 不推进
  if (state.playbackState !== 'RUNNING') return;

  // 3. 未准备好
  if (!state.pivot || state.render.hitIndex < 0) { prepareNextHit(); return; }

  // 4. ease-in-out 插值（angleAtStart 固定，tick 不覆写）
  state.stepAnim.elapsed += dt;
  const t = Math.min(state.stepAnim.elapsed / state.stepAnim.duration, 1);
  const eased = easeInOut(t);
  state.direction = state.stepAnim.angleAtStart + (state.stepAnim.targetAngle - state.stepAnim.angleAtStart) * eased;
  state.render.arcFrom = state.stepAnim.angleAtStart;

  // 5. 命中
  if (t >= 1) {
    state.direction = state.stepAnim.targetAngle;
    state.stepCount++;
    if (state.stepCount >= state.maxSteps) { state.playbackState = 'PAUSED'; return; }
    executeStep();
  }
}
