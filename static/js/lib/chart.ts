import { dateAdd } from '../lib/utils.ts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { Time, NullableTime, TimelyData, Profile, Solar, Usage, ElectricityPrice } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';
import * as DATA_API from '../api/data.ts';

// chart types
import {
    LineChart,
    BarChart
} from 'echarts/charts';
// features
import { LabelLayout, UniversalTransition } from 'echarts/features';
// components
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent
} from 'echarts/components';

// Types
import type {
    BarSeriesOption,
    LineSeriesOption
} from 'echarts/charts';
import type {
    TitleComponentOption, 
    TooltipComponentOption,
    GridComponentOption,
    DatasetComponentOption
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

export type ChartOption = ComposeOption<
    BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>;

// Register the required components
echarts.use([
    LineChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

export enum StateType {
    initial,
    continue,
    stop
}

export type State<T> = {
    state: StateType,
    value: T
};

/**
 * Asynchronous Loading + Dynamic Update
 * interval: Interval in milliseconds to fetch data, default is 0ms
 */
export function initDynamicChart<D, T>(
    elm: HTMLElement,
    optionTemplate: ChartOption,
    initialStateValue: T,
    fetchDataFunc: (state: State<T>) => Promise<D[]>,
    overrideOption: (data: D[], prevData: D[] | null) => ChartOption,
    updateStateFunc: (state: State<T>, data: D[]) => State<T>,
    interval: number = 0,
    shouldStopFetchingFunc: (state: State<T>, prevState: State<T> | null) => boolean = (state, _prevState) => {
        return state.state == StateType.stop? true : false;
    }
): echarts.ECharts {
    const chart = echarts.init(elm);
    chart.setOption(optionTemplate);
    chart.showLoading();
    
    let prevState: State<T> | null = null; 
    let curState = { state: StateType.initial, value: initialStateValue};
    let prevData: D[] | null = null;
    let data: D[] | null = null;
    
    const updateData = () => {
        fetchDataFunc(curState)
            .then(fetchedData => {
                chart.hideLoading();
                
                if (!prevData) {
                    prevData = data;  
                } else {
                    prevData = prevData.concat(data!);
                }
                data = fetchedData;
                prevState = curState;
                curState = updateStateFunc(curState, data);
                
                chart.setOption(overrideOption(data, prevData));

                if (shouldStopFetchingFunc(curState, prevState)) {
                    return;
                }
                
                setTimeout(updateData, interval);
            })
            .catch(error => {
                console.error("Failed to fetch data: ", error);
                chart.hideLoading();
            });
    };

    updateData();

    return chart;
}

export type InitChartOptions<D, T> = {
    title: string,
    optionTemplate: ChartOption,
    initialStateValue: T,
    fetchDataFunc: (state: State<T>) => Promise<D[]>,
    overrideOption: (data: D[], prevData: D[] | null) => ChartOption,
    updateStateFunc: (state: State<T>, data: D[]) => State<T>,
    fetchDataStep: number, // number of dates
    interval: number,
    shouldStopFetchingFunc: (state: State<T>, prevState: State<T> | null) => boolean
}

/**
 * if endTime is null, then only request data oncekj
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
                    name: '',
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

export async function initElectricityUsageChart(
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
                        name: 'demo',
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


export async function initSolarChart(
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
                        name: 'demo',
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


export async function initElectricityPriceChart(
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
                        name: 'demo',
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


