// geometry.js — 纯函数库（零副作用、零 import）
// 坐标系：Canvas 屏幕坐标，y 轴向下
// 叉积 D × PQ > 0 → Q 在 D 的顺时针侧

const MARGIN = 20;
const MIN_DIST = 10;

export function cross2d(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

export function isCollinear(p1, p2, p3) {
  return Math.abs(cross2d(p2.x - p1.x, p2.y - p1.y, p3.x - p1.x, p3.y - p1.y)) < 1e-9;
}

export function checkCollinearity(newPoint, points) {
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (isCollinear(newPoint, points[i], points[j])) return true;
    }
  }
  return false;
}

export function minDistanceOk(x, y, points) {
  for (const p of points) {
    const dx = x - p.x, dy = y - p.y;
    if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return false;
  }
  return true;
}

export function findClockwiseNearest(pivotIndex, direction, points) {
  const P = points[pivotIndex];
  const Dx = Math.cos(direction), Dy = Math.sin(direction);
  let bestIndex = -1, bestCross = Infinity;

  for (let i = 0; i < points.length; i++) {
    if (i === pivotIndex) continue;
    const Q = points[i];
    const PQx = Q.x - P.x, PQy = Q.y - P.y;
    const cr = Dx * PQy - Dy * PQx;
    if (cr > 1e-9 && cr < bestCross) { bestCross = cr; bestIndex = i; }
  }

  if (bestIndex === -1) return null;
  return { hitIndex: bestIndex, hitAngle: Math.atan2(points[bestIndex].y - P.y, points[bestIndex].x - P.x) };
}

export function isBalanced(direction, pivotIndex, points) {
  const n = points.length;
  if (n <= 2) return true;
  const half = Math.floor((n - 1) / 2);
  const P = points[pivotIndex];
  const Dx = Math.cos(direction), Dy = Math.sin(direction);
  let left = 0, right = 0;
  for (let i = 0; i < n; i++) {
    if (i === pivotIndex) continue;
    const cr = Dx * (points[i].y - P.y) - Dy * (points[i].x - P.x);
    if (cr > 1e-9) right++;
    else if (cr < -1e-9) left++;
  }
  return left >= half && right >= half;
}

export function computeBalanceRange(pivotIndex, points) {
  const n = points.length;
  if (n <= 2) return { min: 0, max: Math.PI * 2 };
  const P = points[pivotIndex];
  const angles = [];
  for (let i = 0; i < n; i++) {
    if (i === pivotIndex) continue;
    angles.push(Math.atan2(points[i].y - P.y, points[i].x - P.x));
  }
  angles.sort((a, b) => a - b);

  const validAngles = [];
  const m = angles.length;
  for (let i = 0; i < m; i++) {
    const a1 = angles[i], a2 = angles[(i + 1) % m];
    let mid = (a1 + a2) / 2;
    if (a2 < a1) mid += Math.PI;
    if (isBalanced(mid, pivotIndex, points)) validAngles.push(mid);
  }

  if (validAngles.length === 0) return null;
  validAngles.sort((a, b) => a - b);
  return { min: validAngles[0], max: validAngles[validAngles.length - 1] };
}

export function clipHalfPlane(direction, pivotX, pivotY, canvasW, canvasH) {
  let polygon = [
    { x: 0, y: 0 }, { x: canvasW, y: 0 },
    { x: canvasW, y: canvasH }, { x: 0, y: canvasH }
  ];
  const Dx = Math.cos(direction), Dy = Math.sin(direction);
  function side(Q) { return Dx * (Q.y - pivotY) - Dy * (Q.x - pivotX); }
  function intersect(A, B) {
    const t = side(A) / (side(A) - side(B));
    return { x: A.x + t * (B.x - A.x), y: A.y + t * (B.y - A.y) };
  }

  const output = [];
  for (let i = 0; i < polygon.length; i++) {
    const curr = polygon[i], prev = polygon[(i + polygon.length - 1) % polygon.length];
    const cs = side(curr), ps = side(prev);
    if (cs >= 0) { if (ps < 0) output.push(intersect(prev, curr)); output.push(curr); }
    else if (ps >= 0) output.push(intersect(prev, curr));
  }
  return output.length >= 3 ? output : null;
}

export function generateRandomPoints(n, canvasW, canvasH) {
  const points = [];
  let attempts = 0;
  while (points.length < n && attempts < n * 200) {
    const x = MARGIN + Math.random() * (canvasW - 2 * MARGIN);
    const y = MARGIN + Math.random() * (canvasH - 2 * MARGIN);
    if (minDistanceOk(x, y, points) && !checkCollinearity({ x, y }, points)) {
      points.push({ x, y, visited: false });
    }
    attempts++;
  }
  return points;
}
