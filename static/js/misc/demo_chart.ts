import { ready, dateAdd } from '../lib/utils.ts';
import * as Chart from '../chart/chart.ts';
import type { State } from '../chart/chart.ts';
import type { TimelyArrayData } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';

const gStartTime = new Date("2023-01-01T15:00:00.000000Z");
const gEndTime = new Date("2023-03-02T15:00:00.000000Z");

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
            window.chart = Chart.initDynamicTimelyChart(
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

ready(() => {
    demoProfileUsageLineChart();
    demoProfileSolarBarChart();
    demoProfileMixedChart();
    demoElectricityPriceChart();
    demoProfileSavingChart();
})
