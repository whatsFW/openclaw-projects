// strategies.js — 4 种策略函数
// 策略签名：(round, state, rng?) → { spend: number } | 'win' | 'lose'
// spend 为本回合花费金币（0 表示全攒利息，5 表示全花）

// 策略 1：纯攒利息 — 不花钱，全攒利息（但因此经常输）
// 不花金币 → 弱势 → 大概率输（lose streak 奖励 + 利息最大化）
export function pureInterest(round, state) {
  return { spend: 0 };
}

// 策略 2：纯连胜 — 尽力维持连胜（花金币保赢）
// 前期花 3-4 金币确保赢，后期适当减少
export function pureWinStreak(round, state) {
  const spend = round <= 5 ? 4 : (round <= 10 ? 3 : 2);
  return { spend };
}

// 策略 3：连败转连胜 — 前期不花（攒金+连败奖励），后期花金币转胜
export function loseToWin(round, state, rng) {
  const transition = rng ? Math.max(2, Math.min(6, 4 + Math.round((rng() - 0.5) * 2))) : 4;
  if (round <= transition) return { spend: 0 };
  const spend = round <= transition + 5 ? 3 : 2;
  return { spend };
}

// 策略 4：均衡 — 中等花费，50% 胜率
export function balanced(round, state, rng) {
  if (rng) return { spend: rng() < 0.5 ? 0 : 4 };
  return { spend: round % 2 === 0 ? 0 : 4 };
}

// 策略元信息
export const STRATEGIES = {
  pureInterest:   { name: '纯攒利息',   color: '#3b82f6', fn: pureInterest },
  pureWinStreak:  { name: '纯连胜',     color: '#22c55e', fn: pureWinStreak },
  loseToWin:      { name: '连败转连胜', color: '#f97316', fn: loseToWin },
  balanced:       { name: '均衡',       color: '#8b5cf6', fn: balanced }
};
