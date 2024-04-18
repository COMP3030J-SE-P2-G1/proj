import * as echarts from 'echarts/core';
import { initDynamicChart, StateType } from './basic';
import type { InitChartOptions, State } from './basic';
import type { NullableTime, TimelyData, Solar, Usage, ElectricityPrice } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';
import * as DATA_API from '../api/data.ts';
import { dateAdd } from '../lib/utils.ts';


/**
 * if endTime is null, then only request data once
 */
export async function initDynamicLineChart<D extends TimelyData>(
    elm: HTMLElement,
    startTime: Date | null,
    endTime: Date | null,
    initChartOptions: Partial<InitChartOptions<D, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const {
        title = "Line Chart",
        optionTemplate = {
            title: {
                text: title
            },
            xAxis: {
                data: []
            },
            yAxis: {},
            series: [
                {
                    name: 'line0',
                    type: 'line',
                    data: []
                }
            ]
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

export async function initElectricityUsageLineChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    initChartOptions: Partial<InitChartOptions<Usage, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    let profile = await PROFILE_API.getProfile(profileId);
    let gStartTime = startTime ? startTime : new Date(profile.start_time);
    let gEndTime = endTime ? endTime : new Date(profile.end_time);

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
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item.time)
                },
                series: [
                    {
                        name: 'line0',
                        data: data.map(item => item.usage)
                    }
                ]
            }
        },
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicLineChart<Usage>(
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


export async function initSolarLineChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    initChartOptions: Partial<InitChartOptions<Solar, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    let profile = await PROFILE_API.getProfile(profileId);
    let gStartTime = startTime ? startTime : new Date(profile.start_time);
    let gEndTime = endTime ? endTime : new Date(profile.end_time);

    const {
        title = "Solar Chart",
        optionTemplate,
        initialStateValue = gStartTime.toISOString(),
        fetchDataStep = 15,
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            const endTime = startTime ? dateAdd(startTime, fetchDataStep) : null;
            return PROFILE_API.getSolar(profile.id, startTime, endTime);
        },
        overrideOption = (data, prevData) => {
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item.time)
                },
                series: [
                    {
                        name: 'line0',
                        data: data.map(item => item.generation)
                    }
                ]
            }
        },
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicLineChart<Solar>(
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


export async function initElectricityPriceLineChart(
    elm: HTMLElement,
    startTime: Date | null = null,
    endTime: Date | null = null,
    initChartOptions: Partial<InitChartOptions<ElectricityPrice, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const {
        title = "Electricity Price Chart",
        optionTemplate,
        initialStateValue,
        fetchDataStep = 15,
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            const endTime = startTime ? dateAdd(startTime, fetchDataStep) : null;
            const spanHours = endTime ? null : fetchDataStep * 24;
            console.log(startTime, endTime, spanHours);
            return DATA_API.getElectricityPrice(startTime, endTime, spanHours);
        },
        overrideOption = (data, prevData) => {
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item.time)
                },
                series: [
                    {
                        name: 'line0',
                        data: data.map(item => item.spot)
                    }
                ]
            }
        },
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicLineChart<ElectricityPrice>(
        elm,
        startTime,
        endTime,
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


