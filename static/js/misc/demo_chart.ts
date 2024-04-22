import { ready, dateAdd } from '../lib/utils.ts';
import * as Chart from '../chart/chart.ts';
import type { State } from '../chart/chart.ts';
import type { Solar } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';

const gStartTime = new Date("2023-01-01T15:00:00.000000Z");
const gEndTime = new Date("2023-03-03T15:00:00.000000Z");

async function demoInitDynamicChart() {
    const elm = document.getElementById("initDynamicChart")!;
    let profile = await PROFILE_API.getProfile(1);
    let fetchCounter = 0;

    Chart.initDynamicChart<Solar, string>(
        elm,
        {
            title: {
                text: "demoInitDynamicChart"
            },
            xAxis: {
                data: []
            },
            yAxis: {},
            series: [
                {
                    name: 'demo',
                    type: 'line',
                    data: []
                }
            ]
        },
        profile.start_time,
        async state => {
            const startTime = new Date(state.value);
            const endTime = dateAdd(startTime, 15);
            return PROFILE_API.getSolar(profile.id, startTime, endTime);
        },
        (data, prevData) => {
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item.time)
                },
                series: [
                    {
                        name: 'demo',
                        data: data.map(item => item.generation)
                    }
                ]
            }
        },
        (state, data) => {
            const newState: State<string> = Object.assign({}, state);
            if (fetchCounter > 4) newState.state = Chart.StateType.stop;
            newState.value = data[data.length - 1].time;
            fetchCounter ++;
            return newState;
        },
        300
    );
}

function demoInitElectricityUsageLineChart() {
    const elm = document.getElementById("initElectricityUsageLineChart");
    if (elm) Chart.initElectricityUsageChart(elm, 1, gStartTime, gEndTime, { interval: 100});
}

function demoInitSolarLineChart() {
    const elm = document.getElementById("initSolarLineChart");
    if (elm) Chart.initSolarChart(elm, 1, gStartTime, gEndTime, {
        type: {
            type: "bar",
            xFieldName: "time",
            yFieldName: "generation"
        },
        fetchDataStep: 30,
        interval: 100
    });
}

function demoInitElectricityPriceLineChart() {
    const elm = document.getElementById("initElectricityPriceLineChart");
    if (elm) Chart.initElectricityPriceChart(elm, gStartTime, gEndTime);
}

function demoInitElectricityUsagePieChart() {
    const elm = document.getElementById("initElectricityUsageChart-PieChart");
    if (elm) Chart.initElectricityUsageChart(elm, 1, gStartTime, gEndTime, {
        type: {
            type: "pie",
            xFieldName: "time",
            yFieldName: "usage",
            format: "MMMM"
        }
    });
}


ready(() => {
    demoInitDynamicChart();
    demoInitElectricityUsageLineChart();
    demoInitSolarLineChart();
    demoInitElectricityPriceLineChart();
    demoInitElectricityUsagePieChart();
})
