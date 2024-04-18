import { initElectricityPriceLineChart } from '../chart/chart.ts';

function initCharts() {
    const electricityUsageChartElm = document.getElementById("electricity_price");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityPriceLineChart(electricityUsageChartElm);
}


export default function onLoad() {
    initCharts();
}
