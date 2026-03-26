// app.js — UI 控制层（导入 model 模块，不直接操作 ECharts 配置细节）

import { STRATEGIES } from '../model/strategies.js';
import { compareStrategies, simulate, runOneGame } from '../model/engine.js';
import { initCharts, updateLineChart, updateBoxChart } from './charts.js';

let charts;
const activeStrategies = new Set(Object.keys(STRATEGIES));

function getConfig() {
  return {
    roundCount: parseInt(document.getElementById('param-rounds').value),
    baseIncome: parseInt(document.getElementById('param-base').value),
    interestCap: parseInt(document.getElementById('param-cap').value),
    streakRewards: { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: parseInt(document.getElementById('param-streak5').value) }
  };
}

function buildStrategyList() {
  const container = document.getElementById('strategy-list');
  container.innerHTML = '';
  for (const [key, strat] of Object.entries(STRATEGIES)) {
    const div = document.createElement('div');
    div.className = 'strategy-check';
    div.innerHTML = `
      <input type="checkbox" id="cb-${key}" ${activeStrategies.has(key) ? 'checked' : ''} style="accent-color:${strat.color}">
      <span class="dot" style="background:${strat.color}"></span>
      <span>${strat.name}</span>
    `;
    div.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) activeStrategies.add(key);
      else activeStrategies.delete(key);
    });
    container.appendChild(div);
  }
}

function updateSliderLabels() {
  document.getElementById('val-rounds').textContent = document.getElementById('param-rounds').value;
  document.getElementById('val-base').textContent = document.getElementById('param-base').value;
  document.getElementById('val-cap').textContent = document.getElementById('param-cap').value;
  document.getElementById('val-streak5').textContent = document.getElementById('param-streak5').value;
  document.getElementById('val-sims').textContent = document.getElementById('param-sims').value;
}

function runSimulation() {
  if (activeStrategies.size === 0) return;

  const config = getConfig();
  const n = parseInt(document.getElementById('param-sims').value);
  const selectedStrategies = {};
  for (const key of activeStrategies) {
    selectedStrategies[key] = STRATEGIES[key];
  }

  const start = performance.now();
  const comparison = compareStrategies(config, selectedStrategies, config.roundCount, n);
  const elapsed = (performance.now() - start).toFixed(0);

  document.getElementById('perf-info').textContent = `模拟耗时：${elapsed}ms (${n} 次 × ${config.roundCount} 回合)`;

  // 构建折线图数据
  const lineData = {};
  for (const [key, result] of Object.entries(comparison.results)) {
    lineData[key] = {
      name: result.name,
      color: result.color,
      data: result.simulation.avgByRound
    };
  }
  updateLineChart(charts.line, lineData, config.roundCount);

  // 构建箱线图数据
  const boxData = {};
  for (const [key, result] of Object.entries(comparison.results)) {
    boxData[key] = {
      name: result.name,
      color: result.color,
      min: result.simulation.minGold,
      q1: result.simulation.p25,
      median: result.simulation.medianGold,
      q3: result.simulation.p75,
      max: result.simulation.maxGold
    };
  }
  updateBoxChart(charts.box, boxData);
}

function recommend() {
  if (activeStrategies.size === 0) return;

  const config = getConfig();
  const n = parseInt(document.getElementById('param-sims').value);
  const selectedStrategies = {};
  for (const key of activeStrategies) {
    selectedStrategies[key] = STRATEGIES[key];
  }

  const comparison = compareStrategies(config, selectedStrategies, config.roundCount, n);
  const best = comparison.results[comparison.bestKey];

  let html = `<strong>🏆 推荐策略：${best.name}</strong><br>`;
  html += `期望最终金币：<strong>${best.simulation.avgGold.toFixed(1)}</strong> 金`;

  // 与其他策略对比
  for (const [key, result] of Object.entries(comparison.results)) {
    if (key === comparison.bestKey) continue;
    const diff = (best.simulation.avgGold - result.simulation.avgGold).toFixed(1);
    html += `<br>比 ${result.name} 多 <strong>+${diff}</strong> 金`;
  }

  const el = document.getElementById('recommendation');
  el.innerHTML = html;
  el.style.display = 'block';
}

function init() {
  charts = initCharts();
  buildStrategyList();

  // 滑块实时更新标签
  for (const id of ['param-rounds', 'param-base', 'param-cap', 'param-streak5', 'param-sims']) {
    document.getElementById(id).addEventListener('input', updateSliderLabels);
  }

  // 参数变化即时运行（debounce）
  let timer;
  function onParamChange() {
    clearTimeout(timer);
    timer = setTimeout(runSimulation, 150);
  }
  for (const id of ['param-rounds', 'param-base', 'param-cap', 'param-streak5']) {
    document.getElementById(id).addEventListener('input', onParamChange);
  }

  document.getElementById('btn-run').addEventListener('click', runSimulation);
  document.getElementById('btn-recommend').addEventListener('click', recommend);

  // 初始运行
  runSimulation();
}

init();
