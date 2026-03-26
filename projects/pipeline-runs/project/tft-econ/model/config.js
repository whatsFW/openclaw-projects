// config.js — TFT 经济模型参数（纯数据，可替换为不同版本）

export const CONFIG = {
  baseIncome: 5,
  interestRate: 10,       // 每 10 金 → 1 利息
  interestCap: 5,         // 利息上限
  roundCount: 20,         // 默认回合数
  streakRewards: {        // 连胜/连败奖励梯度
    0: 0,
    1: 0,
    2: 1,
    3: 1,
    4: 2,
    5: 3
  },
  maxStreak: 5            // 奖励计算的连胜/连败上限
};

export function getStreakBonus(streak) {
  const s = Math.min(Math.abs(streak), CONFIG.maxStreak);
  return CONFIG.streakRewards[s] || CONFIG.streakRewards[CONFIG.maxStreak];
}
