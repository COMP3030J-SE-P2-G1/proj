import { dateAdd } from '../lib/utils.ts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import * as PROFILE_API from '../api/profile.ts';

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
                if (shouldStopFetchingFunc(curState, prevState)) {
                    return;
                }
                
                chart.setOption(overrideOption(data, prevData));
                
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

export async function initDynamicLineChart<D extends PROFILE_API.TimelyData>(
    elm: HTMLElement,
    profile: PROFILE_API.Profile | number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    initChartOptions: Partial<InitChartOptions<D, PROFILE_API.Time>> = {},
): Promise<echarts.ECharts>  {
    profile = typeof profile === 'string' ? await PROFILE_API.getProfile(profile) : profile as PROFILE_API.Profile;
    let gStartTime = startTime ? startTime : new Date(profile.start_time);
    let gEndTime = endTime ? endTime : new Date(profile.end_time);
    
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
        initialStateValue = gStartTime.toISOString(),
        fetchDataFunc,
        overrideOption,
        updateStateFunc = (state, data) => {
            const newState: State<PROFILE_API.Time> = Object.assign({}, state);
            const rawEndData = data[data.length - 1]
            newState.value = rawEndData.time;
            const endDate = new Date(rawEndData.time);
            if (endDate >= gEndTime) newState.state = StateType.stop;
            return newState;
        },
        interval = 0,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    const chart = initDynamicChart<D, PROFILE_API.Time>(
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
    initChartOptions: Partial<InitChartOptions<PROFILE_API.Usage, PROFILE_API.Time>> = {},
): Promise<echarts.ECharts>  {
    let profile = await PROFILE_API.getProfile(profileId);

    const {
        title = "Electricity Usage Chart",
        optionTemplate,
        initialStateValue,
        fetchDataStep = 15,
        fetchDataFunc = async state => {
            const startTime = new Date(state.value);
            const endTime = dateAdd(startTime, fetchDataStep);
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
    
    return initDynamicLineChart<PROFILE_API.Usage>(
        elm,
        profile,
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


export async function initSolarChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    initChartOptions: Partial<InitChartOptions<PROFILE_API.Solar, string>> = {},
): Promise<echarts.ECharts>  {
    let profile = await PROFILE_API.getProfile(profileId);

    const {
        title = "Solar Chart",
        optionTemplate,
        initialStateValue,
        fetchDataStep = 15,
        fetchDataFunc = async state => {
            const startTime = new Date(state.value);
            const endTime = dateAdd(startTime, fetchDataStep);
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
    
    return initDynamicLineChart<PROFILE_API.Solar>(
        elm,
        profile,
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

