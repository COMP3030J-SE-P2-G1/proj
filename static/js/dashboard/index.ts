import * as Chart from '../chart/chart.ts';
import * as echarts from 'echarts/core';

function initCharts() {
    const electricityUsageChartElm = document.getElementById("electricity_price");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity_price."); return;}
    
    const dataSources = [
        new Chart.ElectricityPriceDataSource()
    ];

    Chart.initDynamicTimelyChart(
        electricityUsageChartElm,
        dataSources,
        {
            dateset: {
                source: []
            },
            tooltip: {
                trigger: 'axis'
            },
            title: {
                left: 'center',
                text: 'Electricity Price'
            },
            xAxis: {
                type: 'time',
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                axisLabel: {
                    formatter: "${value}",
                },
                max: function (value) {
                    return value.max * 2;
                }
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
                    name: 'Price',
                    type: 'line',
                    symbol: 'none',
                    sampling: 'lttb',
                    itemStyle: {
                        color: 'rgb(255, 70, 131)'
                    },
                    tooltip: {
                        valueFormatter: value => `${parseFloat(value).toFixed(2)} €/MWh`
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgb(255, 158, 68)'
                            },
                            {
                                offset: 1,
                                color: 'rgb(255, 70, 131)'
                            }
                        ])
                    },
                    encode: { x: 0, y: 1 },
                }
            ],
            animation: false, // disable animation to achieve the best performance
        }
    )
}


export default function onLoad() {
    initCharts();
}
