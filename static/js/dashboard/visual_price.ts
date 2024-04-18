import { initElectricityPriceLineChart } from '../chart/chart.ts';
import * as echarts from 'echarts/core';

function initCharts() {
    const electricityUsageChartElm = document.getElementById("electricity_price");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityPriceLineChart(electricityUsageChartElm, null, null, {
        optionTemplate: {
            tooltip: {
                trigger: 'axis',
                position: function (pt) {
                  return [pt[0], '10%'];
                }
              },
              toolbox: {
                feature: {
                  saveAsImage: {}
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
                max: 1000
              },
              yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                max: function (value) {
                  return value.max + 100;
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
                  name: 'line0',
                  type: 'line',
                  symbol: 'none',
                  sampling: 'lttb',
                  itemStyle: {
                    color: 'rgb(255, 70, 131)'
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
                  data: []
                }
              ]
        }
    });
}


export default function onLoad() {
    initCharts();
}
