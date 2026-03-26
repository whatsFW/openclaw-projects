// renderer.js — 纯绘制（不计算、不修改 state、不处理事件）

let ctx = null, canvas = null;

const C = {
  bg: '#0f172a',
  ptDefault: '#94a3b8', ptPivot: '#fbbf24', ptHit: '#22d3ee',
  ptVisited: 'rgba(148,163,184,0.35)',
  line: 'rgba(255,255,255,0.85)',
  arc: 'rgba(34,211,238,0.45)',
  mask: 'rgba(59,130,246,0.12)',
  balance: 'rgba(251,191,36,0.4)',
  text: '#94a3b8'
};

export function init(el) { canvas = el; ctx = canvas.getContext('2d'); resize(); }
export function resize() { if (canvas) { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; } }
export function getSize() { return { w: canvas ? canvas.width : 800, h: canvas ? canvas.height : 600 }; }
export function clear() { if (!ctx || !canvas) return; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, canvas.width, canvas.height); }

export function drawPoints(points, pivotIndex, hitIndex, switchAnim) {
  if (!ctx) return;
  let fadeAlpha = 1, riseAlpha = 0, riseR = 0;
  if (switchAnim) {
    if (switchAnim.phase === 'OLD_FADE') fadeAlpha = 1 - switchAnim.progress;
    else if (switchAnim.phase === 'NEW_RISE') { riseAlpha = switchAnim.progress; riseR = 4 + 6 * switchAnim.progress; }
  }

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    let color, r, alpha = 1;
    if (switchAnim && switchAnim.phase === 'OLD_FADE' && i === switchAnim.oldPivot) {
      color = C.ptPivot; r = 16 - 8 * switchAnim.progress; alpha = fadeAlpha;
    } else if (switchAnim && switchAnim.phase === 'NEW_RISE' && i === switchAnim.newPivot) {
      color = C.ptPivot; r = riseR; alpha = riseAlpha;
    } else if (i === pivotIndex) { color = C.ptPivot; r = 10; }
    else if (i === hitIndex) { color = C.ptHit; r = 8; }
    else if (p.visited) { color = C.ptVisited; r = 5; }
    else { color = C.ptDefault; r = 6; }

    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function drawLine(pX, pY, dir) {
  if (!ctx || !canvas) return;
  const len = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) * 1.5;
  const dx = Math.cos(dir), dy = Math.sin(dir);
  ctx.beginPath(); ctx.moveTo(pX - dx * len, pY - dy * len); ctx.lineTo(pX + dx * len, pY + dy * len);
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
}

export function drawArc(pX, pY, from, to) {
  if (!ctx || Math.abs(to - from) < 0.01) return;
  const R = 30;
  ctx.beginPath(); ctx.arc(pX, pY, R, from, to);
  ctx.strokeStyle = C.arc; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
  const ax = pX + Math.cos(to) * R, ay = pY + Math.sin(to) * R;
  const aa = to + Math.PI / 2, s = 6;
  ctx.beginPath(); ctx.moveTo(ax, ay);
  ctx.lineTo(ax - s * Math.cos(aa - 0.5), ay - s * Math.sin(aa - 0.5));
  ctx.lineTo(ax - s * Math.cos(aa + 0.5), ay - s * Math.sin(aa + 0.5));
  ctx.closePath(); ctx.fillStyle = C.arc; ctx.fill();
}

export function drawAreaMask(polygon) {
  if (!ctx || !polygon || polygon.length < 3) return;
  ctx.beginPath(); ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) ctx.lineTo(polygon[i].x, polygon[i].y);
  ctx.closePath(); ctx.fillStyle = C.mask; ctx.fill();
}

export function drawBalanceLine(pX, pY, dir) {
  if (!ctx || !canvas) return;
  const len = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) * 1.5;
  const dx = Math.cos(dir), dy = Math.sin(dir);
  ctx.beginPath(); ctx.moveTo(pX - dx * len, pY - dy * len); ctx.lineTo(pX + dx * len, pY + dy * len);
  ctx.strokeStyle = C.balance; ctx.lineWidth = 1.5; ctx.setLineDash([8, 4]); ctx.stroke(); ctx.setLineDash([]);
}

export function drawSwitchAnim(phase, progress, newP) {
  if (!ctx || phase !== 'HIT_PULSE' || !newP) return;
  const pr = 10 + 10 * Math.sin(progress * Math.PI);
  ctx.beginPath(); ctx.arc(newP.x, newP.y, pr, 0, Math.PI * 2);
  ctx.strokeStyle = C.ptHit; ctx.lineWidth = 2;
  ctx.globalAlpha = 1 - progress; ctx.stroke(); ctx.globalAlpha = 1;
}

export function drawPivotRing(x, y) {
  if (!ctx) return;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.strokeStyle = C.ptPivot; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
}

export function drawHint(text, x, y) {
  if (!ctx) return;
  ctx.font = '14px -apple-system,BlinkMacSystemFont,sans-serif';
  ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.fillText(text, x, y);
}

export function drawWarning(text, x, y) {
  if (!ctx) return;
  ctx.font = '13px -apple-system,BlinkMacSystemFont,sans-serif';
  ctx.fillStyle = '#f87171'; ctx.textAlign = 'center'; ctx.fillText(text, x, y - 15);
}
