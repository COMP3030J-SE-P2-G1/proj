var dom = document.getElementById('consumptionChart');
var myChart = echarts.init(dom);
var option;

async function updateConsumptionChart() {
    const profileId = 1; // 假设使用固定的profile ID
    const startTime = '2023-01-01 00:00:00';
    const endTime = '2023-01-01 23:59:59';

    const response = await fetch(`/profile/${profileId}/usage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime,
            end_time: endTime
        })
    });

    if (!response.ok) {
        console.error('Failed to fetch usage data:', response.status);
        return;
    }

    const usageData = await response.json();
    let dateTimes = usageData.map(item => item.time);
    let data = usageData.map(item => item.value);


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