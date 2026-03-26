// main.js — 入口：组装 + rAF + 渲染层序

import { state } from './state.js';
import { clipHalfPlane } from './geometry.js';
import * as renderer from './renderer.js';
import * as animation from './animation.js';
import * as ui from './ui.js';

let lastTime = 0;

function init() {
  renderer.init(document.getElementById('canvas'));
  ui.bindAll(document.getElementById('canvas'));
  window.addEventListener('resize', () => renderer.resize());
  requestAnimationFrame(loop);
}

function loop(ts) {
  const dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.05) : 0;
  lastTime = ts;
  animation.tick(dt);
  render();
  requestAnimationFrame(loop);
}

function render() {
  const { w, h } = renderer.getSize();

  // 更新区域遮罩（在 render 层做，因为需要 canvas 尺寸）
  if (state.pivot && state.playbackState === 'RUNNING') {
    state.render.areaPolygon = clipHalfPlane(state.direction, state.pivot.x, state.pivot.y, w, h);
  }

  renderer.clear();

  // 1. 区域遮罩
  if (state.render.areaPolygon) renderer.drawAreaMask(state.render.areaPolygon);

  // 2. 平衡线
  if (state.playbackState === 'IDLE' && state.pivot)
    renderer.drawBalanceLine(state.pivot.x, state.pivot.y, state.direction);

  // 3. 弧线
  if (state.pivot && state.playbackState === 'RUNNING')
    renderer.drawArc(state.pivot.x, state.pivot.y, state.render.arcFrom, state.render.arcTo);

  // 4. 直线
  if (state.pivot) renderer.drawLine(state.pivot.x, state.pivot.y, state.direction);

  // 5. 支点高亮
  if (state.pivot) renderer.drawPivotRing(state.pivot.x, state.pivot.y);

  // 6. 支点切换动画
  if (state.switchAnim) {
    renderer.drawSwitchAnim(state.switchAnim.phase, state.switchAnim.progress,
      state.switchAnim.phase === 'HIT_PULSE' ? state.points[state.switchAnim.newPivot] : null);
  }

  // 7. 点
  renderer.drawPoints(state.points, state.pivot ? state.pivot.index : -1, state.render.hitIndex, state.switchAnim);

  // 8. 提示
  if (state.playbackState === 'IDLE' && state.points.length === 0)
    renderer.drawHint('点击"随机生成"或点击画布添加点', w / 2, h / 2);
  else if (state.playbackState === 'IDLE' && state.points.length > 0 && !state.pivot)
    renderer.drawHint('点击一个点作为支点', w / 2, h - 30);

  // 步数
  document.getElementById('step-count').textContent = state.stepCount;
  document.getElementById('pivot-label').textContent = state.pivot ? 'P' + (state.pivot.index + 1) : '-';
}

init();
