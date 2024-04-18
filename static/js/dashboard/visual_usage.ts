import { initElectricityUsageChart, initElectricityUsagePieChart } from '../chart/chart.ts';
import * as echarts from 'echarts/core';

function initCharts() {
    const electricityUsageChartElm = document.getElementById("electricity-usage-chart");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityUsageChart(electricityUsageChartElm, 1, null, null, {
        optionTemplate: {
            tooltip: {
                trigger: 'axis',
                position: function (pt) {
                    return [pt[0], '10%'];
                }
            },
            title: {
                left: 'center',
                text: 'Electricity Usage'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: [],
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%']
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 10
                },
                {
                    start: 0,
                    end: 10
                }
            ],
            series: [
                {
                    name: 'line0',
                    type: 'line',
                    symbol: 'none',
                    sampling: 'lttb',
                    itemStyle: {
                        color: 'rgba(58,77,233,0.8)'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(58,77,233,0.8)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(58,77,233,0.3)'
                            }
                        ])
                    },
                    data: []
                }
            ]
        }
    });

    const electricityPieChartElm = document.getElementById("electricity-pie-chart");
    if (!electricityPieChartElm) { console.error("Cannot find HTML element #electricity-pie-chart."); return;}
    initElectricityUsagePieChart(electricityPieChartElm, 1, null, null, {
        optionTemplate: {
            title: {
                text: 'Electricity Usage',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            series: [
                {
                    type: 'pie',
                    radius: '50%',
                    data: [],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ],
            animation: false,
        }
    });
}

export default function onLoad() {
    initCharts();
}

