// ui.js — DOM 事件绑定

import { state } from './state.js';
import { generateRandomPoints, checkCollinearity, minDistanceOk, computeBalanceRange, isBalanced, clipHalfPlane } from './geometry.js';
import * as renderer from './renderer.js';
import * as animation from './animation.js';

let canvas = null, isDragging = false, pendingPivot = -1;

export function bindAll(el) {
  canvas = el;
  document.getElementById('btn-random').addEventListener('click', onRandom);
  document.getElementById('btn-clear').addEventListener('click', onClear);
  document.getElementById('btn-toggle').addEventListener('click', onToggle);
  document.getElementById('btn-step').addEventListener('click', onStep);
  document.getElementById('btn-reset').addEventListener('click', onReset);
  document.getElementById('speed-slider').addEventListener('input', function () {
    state.speedMultiplier = parseInt(this.value);
    document.getElementById('speed-label').textContent = this.value + 'x';
  });
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onUp);
}

function onRandom() {
  if (state.playbackState !== 'IDLE') return;
  const n = Math.max(3, Math.min(parseInt(document.getElementById('point-count').value) || 10, state.maxPoints));
  const { w, h } = renderer.getSize();
  state.points = generateRandomPoints(n, w, h);
  pendingPivot = -1;
  animation.reset();
}

function onClear() { animation.clearAll(); pendingPivot = -1; }

function onToggle() {
  const btn = document.getElementById('btn-toggle');
  if (state.playbackState === 'IDLE' || state.playbackState === 'PAUSED') {
    if (state.playbackState === 'IDLE' && pendingPivot >= 0) {
      state.points[pendingPivot].visited = false;
      state.pivot = { index: pendingPivot, x: state.points[pendingPivot].x, y: state.points[pendingPivot].y };
      state.stepCount = 0;
    }
    animation.start();
    if (state.playbackState === 'RUNNING') btn.textContent = '暂停';
  } else if (state.playbackState === 'RUNNING') {
    animation.pause();
    btn.textContent = '继续';
  }
}

function onStep() {
  animation.singleStep();
  document.getElementById('btn-toggle').textContent = '继续';
}

function onReset() {
  animation.reset();
  pendingPivot = -1;
  document.getElementById('btn-toggle').textContent = '开始';
}

function onClick(e) {
  if (state.playbackState !== 'IDLE' || isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;

  for (let i = 0; i < state.points.length; i++) {
    const p = state.points[i], dx = x - p.x, dy = y - p.y;
    if (dx * dx + dy * dy < 225) { selectPivot(i); return; }
  }
  if (state.points.length >= state.maxPoints) return;
  if (!minDistanceOk(x, y, state.points)) return;
  if (checkCollinearity({ x, y }, state.points)) {
    renderer.drawWarning('三点共线，无法添加', x, y);
    return;
  }
  state.points.push({ x, y, visited: false });
}

function selectPivot(idx) {
  for (const p of state.points) p.visited = false;
  pendingPivot = idx;
  state.balanceRange = computeBalanceRange(idx, state.points);
  if (state.balanceRange) state.direction = (state.balanceRange.min + state.balanceRange.max) / 2;
}

function onDown(e) {
  if (state.playbackState !== 'IDLE' || !state.balanceRange || pendingPivot < 0) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const p = state.points[pendingPivot];
  const d = Math.hypot(x - p.x, y - p.y);
  if (d > 15 && d < 200) isDragging = true;
}

function onMove(e) {
  if (!isDragging || pendingPivot < 0) return;
  const rect = canvas.getBoundingClientRect();
  const newAngle = Math.atan2(e.clientY - rect.top - state.points[pendingPivot].y, e.clientX - rect.left - state.points[pendingPivot].x);
  if (isBalanced(newAngle, pendingPivot, state.points)) state.direction = newAngle;
}

function onUp() { isDragging = false; }
