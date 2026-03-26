// charts.js — ECharts 图表封装（UI 层不直接操作配置细节）

export function initCharts() {
  return {
    line: echarts.init(document.getElementById('chart-main')),
    box: echarts.init(document.getElementById('chart-distribution'))
  };
}

/**
 * 更新折线图：多策略金币积累曲线叠加 + hover 经济明细
 * @param {Object} chart - ECharts 实例
 * @param {Object} lineData - { key: { name, color, data: [{gold, baseIncome, interest, streakBonus}, ...] } }
 * @param {number} rounds - 回合数
 */
export function updateLineChart(chart, lineData, rounds) {
  const xData = Array.from({ length: rounds }, (_, i) => `R${i + 1}`);
  const series = [];
  const legend = [];
  // 存储明细数据供 tooltip 使用
  const detailMap = {};

  for (const [key, d] of Object.entries(lineData)) {
    legend.push(d.name);
    detailMap[d.name] = d.data;
    series.push({
      name: d.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2.5, color: d.color },
      itemStyle: { color: d.color },
      data: d.data.map(v => Math.round(v.gold))
    });
  }

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 13 },
      formatter(params) {
        let html = `<strong>${params[0].axisValue}</strong><br>`;
        for (const p of params) {
          const roundIdx = p.dataIndex;
          const detail = detailMap[p.seriesName];
          if (detail && detail[roundIdx]) {
            const d = detail[roundIdx];
            html += `<span style="color:${p.color}">●</span> <strong>${p.seriesName}</strong><br>`;
            html += `&nbsp;&nbsp;基础收入：${Math.round(d.baseIncome)} 金<br>`;
            html += `&nbsp;&nbsp;利息：${Math.round(d.interest)} 金<br>`;
            html += `&nbsp;&nbsp;连胜/连败奖励：${Math.round(d.streakBonus)} 金<br>`;
            html += `&nbsp;&nbsp;<strong>总金：${p.value} 金</strong><br>`;
          } else {
            html += `<span style="color:${p.color}">●</span> ${p.seriesName}：${p.value} 金<br>`;
          }
        }
        return html;
      }
    },
    legend: { data: legend, textStyle: { color: '#94a3b8' }, top: 0 },
    grid: { left: 60, right: 30, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: '金币',
      nameTextStyle: { color: '#94a3b8' },
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } }
    },
    series,
    animationDuration: 300
  }, true);
}

/**
 * 更新箱线图：最终金币分布
 * @param {Object} chart - ECharts 实例
 * @param {Object} boxData - { key: { name, color, min, q1, median, q3, max } }
 */
export function updateBoxChart(chart, boxData) {
  const categories = [];
  const boxplotData = [];

  for (const [key, d] of Object.entries(boxData)) {
    categories.push(d.name);
    boxplotData.push([d.min, d.q1, d.median, d.q3, d.max]);
  }

  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 13 },
      formatter(params) {
        const d = params.value;
        return `<strong>${params.name}</strong><br>
          最大值：${d[4]} 金<br>
          Q3 (75%)：${d[3]} 金<br>
          中位数：${d[2]} 金<br>
          Q1 (25%)：${d[1]} 金<br>
          最小值：${d[0]} 金`;
      }
    },
    grid: { left: 80, right: 30, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#94a3b8', fontSize: 13 },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: '最终金币',
      nameTextStyle: { color: '#94a3b8' },
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } }
    },
    series: [{
      type: 'boxplot',
      data: boxplotData,
      itemStyle: {
        color: '#1e293b',
        borderColor: '#3b82f6',
        borderWidth: 1.5
      },
      emphasis: {
        itemStyle: { borderColor: '#22d3ee', borderWidth: 2 }
      }
    }],
    animationDuration: 300
  }, true);
}
