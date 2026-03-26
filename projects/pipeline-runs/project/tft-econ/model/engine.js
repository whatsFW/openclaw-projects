// engine.js — 经济模拟引擎（纯函数，零副作用）
// 签名不变：model 可独立运行于 Node.js

import { CONFIG, getStreakBonus } from './config.js';

// 可选随机种子（Xorshift32）
function createRng(seed) {
  let s = seed | 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * 运行单局模拟
 * 策略返回 { spend: number }：
 *   - 花费 spend 金币来影响本回合胜负
 *   - spend ≥ 3 → 确定赢（花够了保赢）
 *   - spend < 3 → 取决于花的金额决定概率（spend=0 → 20%胜率，spend=1 → 40%，spend=2 → 60%）
 *
 * 花掉的金币从当前金币中扣除（先扣花费，再计算剩余金币的利息）
 */
export function runOneGame(config, strategyFn, rounds, rng) {
  const cfg = { ...CONFIG, ...config };
  let gold = 0;
  let winStreak = 0;
  let loseStreak = 0;
  const history = [];

  for (let r = 1; r <= rounds; r++) {
    const state = { gold, winStreak, loseStreak };
    const decision = strategyFn(r, state, rng);

    // 处理策略输出
    let spend = 0;
    if (typeof decision === 'object' && decision !== null) {
      spend = Math.min(decision.spend || 0, gold); // 不能花超过已有金币
    }

    // 确定胜负：spend ≥ 3 → 赢；否则按 spend 决定概率
    let result;
    if (spend >= 3) {
      result = 'win';
    } else {
      const winProb = 0.2 + spend * 0.2; // 0→20%, 1→40%, 2→60%
      result = (rng ? rng() : Math.random()) < winProb ? 'win' : 'lose';
    }

    // 扣除花费
    gold -= spend;

    // 更新连胜/连败
    if (result === 'win') {
      winStreak++;
      loseStreak = 0;
    } else {
      loseStreak++;
      winStreak = 0;
    }

    // 计算收入（利息基于扣花费后的金币）
    const interest = Math.min(Math.floor(gold / cfg.interestRate), cfg.interestCap);
    const streakBonus = result === 'win'
      ? getStreakBonus(winStreak)
      : getStreakBonus(loseStreak);
    const totalIncome = cfg.baseIncome + interest + streakBonus;

    gold += totalIncome;

    history.push({
      round: r,
      result,
      spend,
      winStreak,
      loseStreak,
      baseIncome: cfg.baseIncome,
      interest,
      streakBonus,
      totalIncome,
      gold
    });
  }

  return { rounds: history, totalGold: gold };
}

/**
 * 蒙特卡洛模拟
 * @param {Object} config - 配置
 * @param {Function} strategyFn - 策略函数
 * @param {number} rounds - 回合数
 * @param {number} n - 模拟次数
 * @param {number} seed - 随机种子（可选）
 * @returns {Object} { avgGold, minGold, maxGold, distribution, avgByRound }
 */
export function simulate(config, strategyFn, rounds, n = 1000, seed = 42) {
  const rng = createRng(seed);
  const results = [];
  const roundAccum = new Array(rounds).fill(null).map(() => ({ gold: 0, baseIncome: 0, interest: 0, streakBonus: 0, count: 0 }));

  for (let i = 0; i < n; i++) {
    const game = runOneGame(config, strategyFn, rounds, rng);
    results.push(game.totalGold);
    for (let r = 0; r < game.rounds.length; r++) {
      const g = game.rounds[r];
      roundAccum[r].gold += g.gold;
      roundAccum[r].baseIncome += g.baseIncome;
      roundAccum[r].interest += g.interest;
      roundAccum[r].streakBonus += g.streakBonus;
      roundAccum[r].count++;
    }
  }

  results.sort((a, b) => a - b);

  return {
    avgGold: results.reduce((a, b) => a + b, 0) / n,
    minGold: results[0],
    maxGold: results[n - 1],
    medianGold: results[Math.floor(n / 2)],
    p25: results[Math.floor(n * 0.25)],
    p75: results[Math.floor(n * 0.75)],
    distribution: results,
    avgByRound: roundAccum.map(r => ({
      gold: r.gold / r.count,
      baseIncome: r.baseIncome / r.count,
      interest: r.interest / r.count,
      streakBonus: r.streakBonus / r.count
    }))
  };
}

/**
 * 理论期望值计算
 * @param {Object} config - 配置
 * @param {Function} strategyFn - 策略函数
 * @param {number} rounds - 回合数
 * @returns {Object} 与 runOneGame 格式一致
 */
export function theoreticalExpectation(config, strategyFn, rounds) {
  return runOneGame(config, strategyFn, rounds);
}

/**
 * 生成策略对比报告
 * @param {Object} config - 配置
 * @param {Object} strategies - 策略集合 { key: { name, fn } }
 * @param {number} rounds - 回合数
 * @param {number} n - Monte Carlo 次数
 * @param {number} seed - 随机种子
 * @returns {Object} { results, bestKey, recommendation }
 */
export function compareStrategies(config, strategies, rounds, n = 1000, seed = 42) {
  const results = {};
  let bestKey = null;
  let bestAvg = -1;

  for (const [key, strat] of Object.entries(strategies)) {
    const sim = simulate(config, strat.fn, rounds, n, seed);

    results[key] = {
      name: strat.name,
      color: strat.color,
      simulation: sim
    };

    if (sim.avgGold > bestAvg) {
      bestAvg = sim.avgGold;
      bestKey = key;
    }
  }

  return {
    results,
    bestKey,
    recommendation: `${results[bestKey].name}期望经济最高（${bestAvg.toFixed(1)} 金）`
  };
}
