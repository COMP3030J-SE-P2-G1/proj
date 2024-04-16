let dom = document.getElementById('pricesChart');
let myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});

async function updatePricesChart() {
    const response = await fetch('/static/others/historical-irish-electricity-prices.csv');
    const text = await response.text();
    const lines = text.trim().split('\n');
    let dates = [];
    let prices = [];

    lines.slice(1).forEach(line => {
        const parts = line.split(',');
        let date = parts[0];
        let price = parseFloat(parts[1]);
        dates.push(date);
        prices.push(price);
    });

    const selectedYear = document.getElementById('yearSelect').value;
    const filteredDates = dates.filter(date => date.startsWith(selectedYear));
    const filteredPrices = prices.filter((_, index) => dates[index].startsWith(selectedYear));

    let option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: 'Irish Electricity Prices'
        },
        // toolbox: {
        //   feature: {
        //     dataZoom: {
        //       yAxisIndex: 'none'
        //     },
        //     restore: {},
        //     saveAsImage: {}
        //   }
        // },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: filteredDates
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
                name: 'Price (EUR)',
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
                data: filteredPrices
            }
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }
}

window.addEventListener('load', () => {
    updatePricesChart();
})
