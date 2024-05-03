import { ready, dateAdd } from '../lib/utils.ts';
import * as Chart from '../chart/chart.ts';
import type { State } from '../chart/chart.ts';
import type { TimelyArrayData } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';

const gStartTime = new Date("2023-01-01T15:00:00.000000Z");
const gEndTime = new Date("2023-03-03T15:00:00.000000Z");

// The lowest API. You probably don't need it.
async function demoInitDynamicChart() {
    const elm = document.getElementById("initDynamicChart")!;
    let profile = await PROFILE_API.getProfile(1);
    let fetchCounter = 0;

    Chart.initDynamicChart<TimelyArrayData, string>(
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
            return PROFILE_API.getSolar(profile.id, startTime, endTime, null, 24) as Promise<TimelyArrayData[]>;
        },
        (data, prevData, _prevOption) => {
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item[0])
                },
                series: [
                    {
                        name: 'demo',
                        data: data.map(item => item[1])
                    }
                ]
            }
        },
        (state, data) => {
            const newState: State<string> = Object.assign({}, state);
            if (fetchCounter > 4) newState.state = Chart.StateType.stop;
            newState.value = data[data.length - 1][0] as string;
            fetchCounter ++;
            return newState;
        },
        50
    );
}

function demoInitElectricityUsageLineChart() {
    const elm = document.getElementById("initElectricityUsageLineChart");
    if (elm) Chart.initElectricityUsageChart(elm, 1, gStartTime, gEndTime, 24, {
        title: "initElectricityUsageLineChart",
    });
}

function demoInitSolarLineChart() {
    const elm = document.getElementById("initSolarLineChart");
    if (elm) Chart.initSolarChart(elm, 1, gStartTime, gEndTime, 24, {
        title: "initSolarLineChart"
    });
}

function demoInitElectricityPriceLineChart() {
    const elm = document.getElementById("initElectricityPriceLineChart");
    if (elm) Chart.initElectricityPriceChart(elm, gStartTime, gEndTime, 24, {
        title: "initElectricityPriceLineChart",
    });
}

function demoInitElectricityUsagePieChart() {
    const elm = document.getElementById("initElectricityUsageChart-PieChart");
    if (elm) Chart.initElectricityUsageChart(elm, 1, gStartTime, gEndTime, 24, {
        title: "initElectricityUsageChart-PieChart",
        type: {
            type: "pie",
            xField: 0,
            yField: 1,
            format: "MMMM"
        }
    })
}

function demoInitElectricityPriceHypridChart() {
    const elm = document.getElementById("initElectricityUsageChart-hybrid");
    if (elm) Chart.initElectricityUsageChart(elm, 1, gStartTime, gEndTime, 24, {
        optionTemplate: {
            dataset: [
                {
                    // fake data so that `dimension: 1` below don't produce an
                    // error at chart initialization
                    source: [[1, 2]]
                },
                {
                    transform: {
                        type: 'filter',
                        config: {
                            dimension: 1,
                            '<': 2000
                        }
                    }
                },
            ],
            title: {
                text: "Usage hybrid chart (bar & line whose value is lower than 2000)"
            },
            xAxis: {
                type: 'time'
            },
            yAxis: {},
            series: [
                {
                    encode: { x: 0, y: 1 },
                    type: "bar",
                    // use 0st dataset
                },
                {
                    encode: { x: 0, y: 1 },
                    type: "line",
                    datasetIndex: 1, // use the 1st (begins with 0) dataset
                }
            ],
            animation: false
        }
    });
}


ready(() => {
    demoInitDynamicChart();
    demoInitElectricityUsageLineChart();
    demoInitSolarLineChart();
    demoInitElectricityPriceLineChart();
    demoInitElectricityUsagePieChart();
    demoInitElectricityPriceHypridChart();
})
