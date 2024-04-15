var dom = document.getElementById('consumptionChart');
var myChart = echarts.init(dom);
var option;

async function updateConsumptionChart() {
    var selectedOption = document.getElementById('consumptionSelect').value;
    var dataFile = selectedOption === 'UCD' ? '/static/others/UCD_2023_profile.csv' : '/path/to/usage_data.csv';

    const response = await fetch(dataFile);
    const text = await response.text();
    const lines = text.trim().split('\n');
    let dateTimes = [];
    let data = [];

    // Processing each line to create datetime labels and aggregate data
    lines.slice(1).forEach(line => {
        const parts = line.split(',');
        const day = parts[0]; // Date in '1/1/2023' format
        for (let i = 1; i < parts.length; i++) {
            let time = i * 15 - 15; // Compute the minute of the hour
            let hour = Math.floor(time / 60);
            let minute = time % 60;
            let dateTime = `${day} ${hour}:${minute === 0 ? '00' : minute}`;
            dateTimes.push(dateTime);
            data.push(parseFloat(parts[i]));
        }
    });

    option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: selectedOption === 'UCD' ? 'UCD Electricity Consumption' : 'User Usage Data'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dateTimes
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 2
            },
            {
                start: 0,
                end: 10
            }
        ],
        series: [
            {
                name: 'Consumption',
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                    color: 'rgb(255, 70, 131)'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgb(255, 158, 68)'
                    }, {
                        offset: 1,
                        color: 'rgb(255, 70, 131)'
                    }])
                },
                data: data
            }
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }
}

window.addEventListener('load', updateConsumptionChart);
window.onload = updateConsumptionChart;