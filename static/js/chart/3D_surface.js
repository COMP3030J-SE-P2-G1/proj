fetch('/static/others/UCD.txt')
.then(response => response.text())
.then(text => {
    const lines = text.trim().split('\n');
    const timeLabels = lines[0].split(',').slice(2); // 时间标签
    let data = [];
    const dates = lines.slice(1).map(line => line.split(',')[0]); // 日期标签

    lines.slice(1).forEach((line, indexY) => {
        const parts = line.split(',');
        parts.slice(2).forEach((value, indexX) => {
            if (value) {
                data.push([indexX, indexY, +value]); // 构造数据点
            }
        });
    });

    var dom = document.getElementById('3d_chart');
    var myChart = echarts.init(dom);
    var option = {
        tooltip: {
            // 自定义tooltip显示格式
            formatter: function (params) {
                const value = params.value;
                // 使用时间标签和日期标签数组来获取实际的X, Y轴数据
                return `Date: ${dates[value[1]]}<br>Time: ${timeLabels[value[0]]}<br>Electricity Consumption: ${value[2]}`;
            }
        },
        visualMap: {
            show: true,
            dimension: 2,
            min: 0,
            max: 1300,
            inRange: {
                color: [
                    '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8',
                    '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
                ]
            }
        },
        xAxis3D: {
            type: 'category',
            name: 'Time of Day',
            data: timeLabels
        },
        yAxis3D: {
            type: 'category',
            name: 'Date',
            data: dates
        },
        zAxis3D: {
            type: 'value',
            name: 'Electricity Consumption',
        },
        grid3D: {
            environment: '#FFFFFF',
            light: {
                main: {
                    intensity: 1.2
                }
            }
        },
        series: [{
            type: 'surface',
            wireframe: {
                show: true
            },
            symbolSize:4,
            data: data.map(item => [item[0], item[1], item[2]]) // 转换数据格式
        }]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }
});
