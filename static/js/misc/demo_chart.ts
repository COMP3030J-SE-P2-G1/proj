import { ready, dateAdd } from '../lib/utils.ts';
import * as Chart from '../chart/chart.ts';
import type { State } from '../chart/chart.ts';
import type { TimelyArrayData } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';

const gStartTime = new Date("2023-01-01T15:00:00.000000Z");
const gEndTime = new Date("2023-03-03T15:00:00.000000Z");

function demoProfileUsageLineChart() {
    const elm = document.getElementById("demoProfileUsageLineChart");
    if (elm) PROFILE_API.getProfile(1).then(
        profile => {
            const dataSources = [
                new Chart.ProfileUsageDataSource(
                    profile,
                    {
                        startTime: gStartTime,
                        endTime: gEndTime
                    }
                )
            ];
            Chart.initDynamicTimelyChart(
                elm,
                dataSources,
                Chart.getDefaultOptionTemplate("demoProfileUsageLineChart", dataSources)
            )
        }
    );
}

function demoProfileSolarBarChart() {
    const elm = document.getElementById("demoProfileSolarBarChart");
    if (elm) PROFILE_API.getProfile(1).then(
        profile => {
            const dataSources = [
                new Chart.ProfileSolarDataSource(
                    profile,
                    {
                        startTime: gStartTime,
                        endTime: gEndTime,
                        initChartOptions: {
                            type: {
                                type: "bar",
                                xField: 0,
                                yField: 1,
                            }
                        }
                    }
                )
            ];
            Chart.initDynamicTimelyChart(
                elm,
                dataSources,
                Chart.getDefaultOptionTemplate("demoProfileSolarBarChart", dataSources)
            )
        }
    );
}

function demoProfileMixedChart() {
    const elm = document.getElementById("demoProfileMixedChart");
    if (elm) PROFILE_API.getProfile(1).then(
        profile => {
            const dataSources = [
                new Chart.ProfileUsageDataSource(
                    profile,
                    {
                        startTime: gStartTime,
                        endTime: gEndTime,
                    }
                ),
                new Chart.ProfileSolarDataSource(
                    profile,
                    {
                        startTime: gStartTime,
                        endTime: gEndTime,
                        initChartOptions: {
                            type: {
                                type: "bar",
                                xField: 0,
                                yField: 1,
                            }
                        }
                    }
                )
            ];
            const chart = Chart.initDynamicTimelyChart(
                elm,
                dataSources,
                Chart.getDefaultOptionTemplate("demoProfileMixedChart", dataSources)
            )
        }
    );
}


function demoElectricityPriceChart() {
    const elm = document.getElementById("demoElectricityPriceChart");
    if (elm) {
        const dataSources = [
            new Chart.ElectricityPriceDataSource({
                startTime: gStartTime,
                endTime: gEndTime
            })
        ];
        Chart.initDynamicTimelyChart(
            elm,
            dataSources,
            Chart.getDefaultOptionTemplate("demoElectricityPriceChart", dataSources)
        )
    }
}

function demoProfileSavingChart() {
    const elm = document.getElementById("demoProfileSavingChart");
    if (elm) PROFILE_API.getProfile(1).then(
        profile => {
            const dataSources = [
                new Chart.ProfileSavingDataSource(
                    profile,
                    {
                        startTime: gStartTime,
                        endTime: gEndTime
                    }
                )
            ];
            Chart.initDynamicTimelyChart(
                elm,
                dataSources,
                Chart.getDefaultOptionTemplate("demoProfileSavingChart", dataSources)
            )
        }
    )
}

// function demoInitElectricityPriceHypridChart() {
//     const elm = document.getElementById("initElectricityUsageChart-hybrid");
//     if (elm) Chart.initElectricityUsageChart(elm, 1, gStartTime, gEndTime, "day", {
//         optionTemplate: {
//             dataset: [
//                 {
//                     // fake data so that `dimension: 1` below don't produce an
//                     // error at chart initialization
//                     source: [[1, 2]]
//                 },
//                 {
//                     transform: {
//                         type: 'filter',
//                         config: {
//                             dimension: 1,
//                             '<': 40000
//                         }
//                     }
//                 },
//             ],
//             title: {
//                 text: "Usage hybrid chart (bar & line whose value is lower than 40000)"
//             },
//             xAxis: {
//                 type: 'time'
//             },
//             yAxis: {},
//             series: [
//                 {
//                     encode: { x: 0, y: 1 },
//                     type: "bar",
//                     // use 0st dataset
//                 },
//                 {
//                     encode: { x: 0, y: 1 },
//                     type: "line",
//                     datasetIndex: 1, // use the 1st (begins with 0) dataset
//                 }
//             ],
//             animation: false
//         }
//     });
// }


ready(() => {
    demoProfileUsageLineChart();
    demoProfileSolarBarChart();
    demoProfileMixedChart();
    demoElectricityPriceChart();
    demoProfileSavingChart();
    // demoInitElectricityPriceHypridChart();
})
