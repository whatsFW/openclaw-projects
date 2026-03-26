// test.js — 模型验证脚本（Node.js 独立运行）
// node test.js

import { compareStrategies, simulate, runOneGame } from './engine.js';
import { STRATEGIES } from './strategies.js';
import { CONFIG } from './config.js';

console.log('=== TFT 经济模型验证 ===\n');

// 测试 1：纯攒利息（高度随机性）
console.log('--- 纯攒利息 Monte Carlo (1000 次) ---');
const interestSim = simulate(CONFIG, STRATEGIES.pureInterest.fn, 20, 1000);
console.log(`期望金币：${interestSim.avgGold.toFixed(1)}`);
console.log(`中位数：${interestSim.medianGold}`);
console.log(`Q25-Q75：${interestSim.p25}-${interestSim.p75}`);

// 测试 2：纯连胜（确定性高 - spend≥3 保赢）
console.log('\n--- 纯连胜 Monte Carlo (1000 次) ---');
const winSim = simulate(CONFIG, STRATEGIES.pureWinStreak.fn, 20, 1000);
console.log(`期望金币：${winSim.avgGold.toFixed(1)}`);
console.log(`中位数：${winSim.medianGold}`);

// 测试 3：连败转连胜（有随机转胜点）
console.log('\n--- 连败转连胜 Monte Carlo (1000 次) ---');
const ltSim = simulate(CONFIG, STRATEGIES.loseToWin.fn, 20, 1000);
console.log(`期望金币：${ltSim.avgGold.toFixed(1)}`);
console.log(`中位数：${ltSim.medianGold}`);

// 测试 4：均衡（50/50 随机）
console.log('\n--- 均衡 Monte Carlo (1000 次) ---');
const balSim = simulate(CONFIG, STRATEGIES.balanced.fn, 20, 1000);
console.log(`期望金币：${balSim.avgGold.toFixed(1)}`);
console.log(`中位数：${balSim.medianGold}`);

// 测试 5：策略对比
console.log('\n--- 策略对比 ---');
const comp = compareStrategies(CONFIG, STRATEGIES, 20, 1000);
for (const [key, result] of Object.entries(comp.results)) {
  console.log(`${result.name}：期望 ${result.simulation.avgGold.toFixed(1)} 金`);
}
console.log(`\n推荐：${comp.recommendation}`);

// 测试 6：性能基准
console.log('\n--- 性能基准 ---');
const start = performance.now();
simulate(CONFIG, STRATEGIES.balanced.fn, 30, 1000);
const elapsed = (performance.now() - start).toFixed(1);
console.log(`1000 次 × 30 回合：${elapsed}ms`);
console.log(elapsed < 200 ? '✅ < 200ms 性能达标' : '⚠️ 超过 200ms');
