import { initElectricityUsageLineChart, initElectricityUsagePieChart } from '../chart/chart.ts';

function initCharts() {
    const electricityUsageChartElm = document.getElementById("electricity-usage-chart");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityUsageLineChart(electricityUsageChartElm, 1);

    const electricityPieChartElm = document.getElementById("electricity-pie-chart");
    if (!electricityPieChartElm) { console.error("Cannot find HTML element #electricity-pie-chart."); return;}
    initElectricityUsagePieChart(electricityPieChartElm, 1);
}

export default function onLoad() {
    initCharts();
}

