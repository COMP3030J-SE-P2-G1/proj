import { ready, dateAdd } from '../lib/utils.ts';
import * as Chart from '../lib/chart.ts';
import type { State } from '../lib/chart.ts';
import * as PROFILE_API from '../api/profile.ts';



async function demoInitDynamicChart() {
    const elm = document.getElementById("initDynamicChart")!;
    let profile = await PROFILE_API.getProfile(1);
    let fetchCounter = 0;

    Chart.initDynamicChart<PROFILE_API.Solar, string>(
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

function demoInitElectricityUsageChart() {
    const elm = document.getElementById("initElectricityUsageChart");
    if (elm) Chart.initElectricityUsageChart(elm, 1, null, null, { interval: 100});
}

function demoInitSolarChart() {
    const elm = document.getElementById("initSolarChart");
    if (elm) Chart.initSolarChart(elm, 1, null, null, {
        fetchDataStep: 30,
        interval: 100
    });
}

function demoInitElectricityPriceChart() {
    const elm = document.getElementById("initElectricityPrice");
    if (elm) Chart.initElectricityPriceChart(elm);
}

ready(() => {
    demoInitDynamicChart();
    demoInitElectricityUsageChart();
    demoInitSolarChart();
    // demoInitElectricityPriceChart();
})
