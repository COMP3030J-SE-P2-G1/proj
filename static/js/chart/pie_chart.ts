import * as echarts from 'echarts/core';
import { initDynamicChart, StateType } from './basic';
import type { InitChartOptions, State } from './basic';
import type { NullableTime, TimelyData, Solar, Usage, ElectricityPrice } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';
import { dateAdd } from '../lib/utils.ts';

type StringNumberDict = { [key: string]: number };
type PieSeriesData = { name: string, value: number };


/**
 * if endTime is null, then only request data once
 */
export async function initDynamicPieChart<D extends TimelyData>(
    elm: HTMLElement,
    startTime: Date | null,
    endTime: Date | null,
    initChartOptions: Partial<InitChartOptions<D, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const {
        optionTemplate = {
            title: {
                text: 'Dynamic Pie Chart'
            },
            series: [
                {
                    name: 'pie0',
                    type: 'pie',
                    data: []
                }
            ],
            animation: false // pie chart dynamic updating animation is ugly
        },
        initialStateValue = startTime ? startTime.toISOString() : null,
        fetchDataFunc,
        overrideOption,
        updateStateFunc = (state, data) => {
            const newState: State<NullableTime> = Object.assign({}, state);
            const rawEndData = data[data.length - 1]
            newState.value = rawEndData.time;
            const localEndTime = new Date(rawEndData.time);
            if (endTime == null || localEndTime >= endTime) {
                newState.state = StateType.stop;
            }
            return newState;
        },
        interval = 0,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    const chart = initDynamicChart<D, NullableTime>(
        elm,
        optionTemplate,
        initialStateValue,
        fetchDataFunc!,
        overrideOption!,
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    );
    
    return chart;
}


export async function initElectricityUsagePieChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    initChartOptions: Partial<InitChartOptions<Usage, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    let profile = await PROFILE_API.getProfile(profileId);
    let gStartTime = startTime ? startTime : new Date(profile.start_time);
    let gEndTime = endTime ? endTime : new Date(profile.end_time);
    const monthlyUsageData: StringNumberDict = {};

    const {
        title = "Electricity Usage Chart",
        optionTemplate,
        initialStateValue = gStartTime.toISOString(),
        fetchDataStep = 15,
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            const endTime = startTime ? dateAdd(startTime, fetchDataStep) : null;
            return PROFILE_API.getUsage(profile.id, startTime, endTime);
        },
        overrideOption = (data, prevData) => {
            const newMonthlySumDict = calculateMonthlyUsageSum(data);
            for (let [key, value] of Object.entries(newMonthlySumDict)) {
                if (key in monthlyUsageData) {
                    monthlyUsageData[key] += value;
                } else {
                    monthlyUsageData[key] = value;
                }
            }
            
            return {
                series: [
                    {
                        name: 'pie0',
                        data: convertMonthlyUsageSum(monthlyUsageData)
                    }
                ]
            }
        },
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicPieChart<Usage>(
        elm,
        gStartTime,
        gEndTime,
        {
            title: title,
            optionTemplate: optionTemplate,
            initialStateValue: initialStateValue,
            fetchDataStep: fetchDataStep,
            fetchDataFunc: fetchDataFunc,
            overrideOption: overrideOption,
            updateStateFunc: updateStateFunc,
            interval: interval,
            shouldStopFetchingFunc: shouldStopFetchingFunc
        }
    );
}


function calculateMonthlyUsageSum(data: Usage[]): StringNumberDict {
    const monthlyUsage: StringNumberDict = {};

    data.forEach(item => {
        const date = new Date(item.time);
        const monthYearKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // Month is 0-indexed, add 1 for human-readable format
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!monthlyUsage[monthYearKey]) {
            monthlyUsage[monthYearKey] = 0;
        }
        monthlyUsage[monthYearKey] += item.usage;
    });
    
    return monthlyUsage;
}

function convertMonthlyUsageSum(dict: StringNumberDict): PieSeriesData[] {
    const result = Object.keys(dict).map(key => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1); // Adjust month back to 0-index for Date object
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        return { name: monthName, value: dict[key] };
    });

    return result;
}


function testCalculateMonthlyUsageSum() {
    // Sample data
    const usageData: Usage[] = [
        { id: 1, user_id: 1, time: '2023-06-01T00:00:00Z', usage: 500 },
        { id: 2, user_id: 2, time: '2023-06-15T00:00:00Z', usage: 500 },
        { id: 3, user_id: 3, time: '2023-07-01T00:00:00Z', usage: 600 },
    ];

    console.log(calculateMonthlyUsageSum(usageData));
}
