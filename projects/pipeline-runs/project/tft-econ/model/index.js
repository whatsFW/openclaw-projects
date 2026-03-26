// model/index.js — 模型统一入口
export { CONFIG, getStreakBonus } from './config.js';
export { STRATEGIES, pureInterest, pureWinStreak, loseToWin, balanced } from './strategies.js';
export { runOneGame, simulate, theoreticalExpectation, compareStrategies } from './engine.js';
