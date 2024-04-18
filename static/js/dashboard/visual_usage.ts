import { initElectricityUsageChart } from '../chart/chart.ts';

function initCharts() {
    const electricityUsageChartElm = document.getElementById("electricity-usage-chart");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityUsageChart(electricityUsageChartElm, 1);
}

export default function onLoad() {
    initCharts();
}

