import { initElectricityUsageChart } from '../chart/chart.ts';
import * as echarts from 'echarts/core';

function initCharts() {
    const electricityUsageChartElm = document.getElementById("electricity-usage-chart");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityUsageChart(electricityUsageChartElm, 1, null, null, {
        optionTemplate: {
            dateset: {
                source: []
            },
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
                boundaryGap: false
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
                    name: 'id0',
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
                    encode: { x: 0, y: 1 }
                }
            ]
        }
    });

    const electricityPieChartElm = document.getElementById("electricity-pie-chart");
    if (!electricityPieChartElm) { console.error("Cannot find HTML element #electricity-pie-chart."); return;}
    initElectricityUsageChart(electricityPieChartElm, 1, null, null, {
        type: {
            type: "pie",
            xField: 0,
            yField: 1,
            format: "yyyy-MMMM"
        },
        optionTemplate: {
            dateset: {
                source: []
            },
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
                    encode: {
                        itemName: 0,
                        value: 1
                    },
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

