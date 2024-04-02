var dom = document.getElementById('dataset');
var myChart = echarts.init(dom,{
  renderer: 'canvas',
  useDirtyRect: true
});
var option;

var data = [
['Income', 'Life Expectancy', 'Population', 'Country', 'Year'],
[3500, 68, 15000, 'A', 2018],
[4000, 70, 16000, 'A', 2019],
[4200, 72, 16500, 'A', 2020],
[4500, 74, 17000, 'A', 2021],
[4700, 76, 17500, 'A', 2022],
[4900, 78, 18000, 'A', 2023],
[5100, 80, 18500, 'A', 2024],
[1800, 75, 20000, 'B', 2015],
[5000, 45, 30000, 'B', 2016],
[5500, 47, 32000, 'B', 2017],
[5800, 49, 34000, 'B', 2018],
[6200, 51, 36000, 'B', 2019],
[6500, 53, 38000, 'B', 2020],
[7000, 55, 40000, 'B', 2021],
[7500, 57, 42000, 'B', 2022],
[8000, 59, 44000, 'B', 2023],
[8500, 61, 46000, 'B', 2024],
[6000, 70, 20000, 'C', 2017],
[6200, 72, 22000, 'C', 2018],
[6500, 74, 24000, 'C', 2019],
[6800, 76, 26000, 'C', 2020],
[7000, 78, 28000, 'C', 2021],
[7200, 80, 30000, 'C', 2022],
[7500, 82, 32000, 'C', 2023],
[7800, 84, 34000, 'C', 2024],
[3000, 65, 25000, 'D', 2017],
[3200, 67, 26000, 'D', 2018],
[3500, 69, 27000, 'D', 2019],
[3800, 71, 28000, 'D', 2020],
[4000, 73, 29000, 'D', 2021],
[4300, 75, 30000, 'D', 2022],
[4600, 77, 31000, 'D', 2023],
[4900, 79, 32000, 'D', 2024]
];
var sizeValue ='60%'
var symbolSize = 6;

option = {
  tooltip: {},
  grid3D: {width: '52%'},
  xAxis3D: {},
  yAxis3D: {},
  zAxis3D: {},
  grid: [
    { right: '4%', width: '18%', bottom: sizeValue },
    { right: '30%', width: '18%', bottom: sizeValue },
    { right: '4%', width: '18%', top: sizeValue },
    { right: '30%', width: '18%', top: sizeValue }
  ],
  xAxis: [
    { type: 'value', gridIndex: 0, name: 'Income' },
    { type: 'category', gridIndex: 1, name: 'Country' },
    { type: 'value', gridIndex: 2, name: 'Income' },
    { type: 'value', gridIndex: 3, name: 'Life Expectancy' }
  ],
  yAxis: [
    { type: 'value', gridIndex: 0, name: 'Life Expectancy' },
    { type: 'value', gridIndex: 1, name: 'Income' },
    { type: 'value', gridIndex: 2, name: 'Population' },
    { type: 'value', gridIndex: 3, name: 'Population' }
  ],
  dataset: {
    dimensions: [
      'Income',
      'Life Expectancy',
      'Population',
      'Country',
      { name: 'Year', type: 'time' }
    ],
    source: data
  },
  series: [
    {
      type: 'scatter3D',
      grid3DIndex: 0,
      symbolSize: symbolSize,
      encode: {
        x: 'Population',
        y: 'Life Expectancy',
        z: 'Income',
        tooltip: [0, 1, 2, 3, 4]
      }
    },
    { type: 'scatter',
      symbolSize: symbolSize,
      xAxisIndex: 0,
      yAxisIndex: 0,
      encode: {
        x: 'Income',
        y: 'Life Expectancy',
        tooltip: [0, 1, 2, 3, 4]
      }
    },
    {
      type: 'scatter',
      symbolSize: symbolSize,
      xAxisIndex: 1,
      yAxisIndex: 1,
      encode: {
        x: 'Country',
        y: 'Income',
        tooltip: [0, 1, 2, 3, 4]
      }
    },
    {
      type: 'scatter',
      symbolSize: symbolSize,
      xAxisIndex: 2,
      yAxisIndex: 2,
      encode: {
        x: 'Income',
        y: 'Population',
        tooltip: [0, 1, 2, 3, 4]
      }
    },
    {
      type: 'scatter',
      symbolSize: symbolSize,
      xAxisIndex: 3,
      yAxisIndex: 3,
      encode: {
        x: 'Life Expectancy',
        y: 'Population',
        tooltip: [0, 1, 2, 3, 4]
      }
    }
  ]
};

myChart.setOption(option);
window.addEventListener('resize', myChart.resize);