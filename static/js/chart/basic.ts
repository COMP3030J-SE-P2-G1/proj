import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { NullableTime, TimelyArrayData } from '../api/types.ts';
import { daysBetween } from '../lib/utils.ts';

import { format } from 'date-fns';

// chart types
import {
    LineChart,
    PieChart,
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
    TransformComponent,
    DataZoomComponent
} from 'echarts/components';

// Types
import {
    type PieSeriesOption,
    type BarSeriesOption,
    type LineSeriesOption,
} from 'echarts/charts';

import type {
    TitleComponentOption, 
    TooltipComponentOption,
    GridComponentOption,
    DatasetComponentOption,
    DataZoomComponentOption
} from 'echarts/components';

import type { ComposeOption } from 'echarts/core';

export type ChartOption = ComposeOption<
    PieSeriesOption 
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | DataZoomComponentOption
>;

// Register the required components
echarts.use([
    LineChart,
    BarChart,
    PieChart,
    DataZoomComponent,
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

export type PieChartInterval = 'day' | 'week' | 'month' | 'year';
export type StringNumberDict = { [key: string]: number };

export type Chart2D = {
    type: string,
    xField: string | number,
    yField: string | number,
}

export interface LineChartType extends Chart2D {
    type: "line"
}

export interface BarChartType extends Chart2D {
    type: "bar"
}

export interface PieChartType extends Chart2D {
    type: "pie",
    /** format should be in date-fns format. See https://date-fns.org/v3.6.0/docs/format */
    format: string
}

export type ChartTypeOption =  LineChartType | BarChartType | PieChartType;

const DEFAULT_CHART_TYPE_OPTION: ChartTypeOption = {
    type: 'line',
    xField: 0,
    yField: 1
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
    type: ChartTypeOption,
    optionTemplate: ChartOption,
    initialStateValue: T,
    fetchDataFunc: (state: State<T>) => Promise<D[]>,
    overrideOption: (data: D[], prevData: D[] | null) => ChartOption,
    updateStateFunc: (state: State<T>, data: D[]) => State<T>,
    fetchDataStep: number, // number of dates
    interval: number,
    shouldStopFetchingFunc: (state: State<T>, prevState: State<T> | null) => boolean
}

function getDefaultOptionTemplate<D>(initChartOptions: Partial<InitChartOptions<D, NullableTime>>): ChartOption {
    const title = initChartOptions.title ?? 'Demo Chart';
    const type = initChartOptions.type ?? DEFAULT_CHART_TYPE_OPTION;
    
    if (type.type == 'line' || type.type == 'bar') {
        return {
            dateset: {
                source: []
            },
            title: {
                text: title
            },
            xAxis: {
                type: 'time'
            },
            yAxis: {},
            series: [
                {
                    encode: { x: 0, y: 1 },
                    type: type.type,
                }
            ],
            animation: false // disable animation to get the best performance for large data
        };
    } else { // pie chart
        return {
            dateset: {
                source: []
            },
            title: {
                text: title
            },
            series: [
                
                {
                    type: type.type,
                    encode: {
                        itemName: 0,
                        value: 1
                    }
                }
            ],
            animation: false // pie chart dynamic updating animation is ugly
        };
    }
}

// TODO
function getDefaultOverrideOption<D extends { [key: string]: any }>(initChartOptions: Partial<InitChartOptions<D, NullableTime>>):  (data: D[], prevData: D[] | null) => ChartOption {
    const type = initChartOptions.type ?? DEFAULT_CHART_TYPE_OPTION;
    if (type.type == 'line' || type.type == 'bar') {
        return (data, prevData) => {
            if (prevData) data = prevData.concat(data);
            return {
                dataset: {
                    source: data.map(
                        item => [
                            item[type.xField],
                            item[type.yField]
                        ]
                    )
                }
            };
        };
    } else { // pie chart
        const usageData: StringNumberDict = {};
        return (data, _prevData) => {
            const newUsageSumDict = calculateUsageSum(data, type);
            for (const [key, value] of Object.entries(newUsageSumDict)) {
                if (key in usageData) {
                    usageData[key] += value;
                } else {
                    usageData[key] = value;
                }
            }

            return {
                dataset: {
                    source: Object.entries(usageData)
                }
            }
        };
    }
}

/**
 * Get default fetchDataStep(in day), by default it's 180 if at least one of its
 * parameters is null
 */
export function getDefaultFetchDataStep(
    start: Date | null,
    end: Date | null,
    defaultDays: number = 180
) {
    return (start && end) ? Math.ceil(daysBetween(start, end) / 4) : defaultDays;
}

/**
 * if endTime is null, then only request data once
 */
export async function initDynamicTimelyChart<D extends TimelyArrayData>(
    elm: HTMLElement,
    startTime: Date | null,
    endTime: Date | null,
    initChartOptions: Partial<InitChartOptions<D, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const {
        optionTemplate = getDefaultOptionTemplate<D>(initChartOptions),
        initialStateValue = startTime ? startTime.toISOString() : null,
        fetchDataStep = getDefaultFetchDataStep(startTime, endTime),
        fetchDataFunc,
        overrideOption = getDefaultOverrideOption<D>(initChartOptions),
        updateStateFunc = (state, data) => {
            const newState: State<NullableTime> = Object.assign({}, state);
            const rawEndData = data[data.length - 1]
            newState.value = rawEndData[0] as string;
            const localEndTime = new Date(rawEndData[0]);
            if (endTime) {
                if (localEndTime >= endTime) newState.state = StateType.stop;
            } else {
                const localStartTime = new Date(data[0][0]);
                const timeSpan = localEndTime.getTime() - localStartTime.getTime();
                if (fetchDataStep && timeSpan < fetchDataStep * 24 * 3600)
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


function calculateUsageSum(data: { [key: string]: any }[], config: PieChartType): StringNumberDict {
    const monthlyUsage: StringNumberDict = {};

    data.forEach(item => {
        const date = new Date(item[config.xField]);
        const key = format(date, config.format);

        if (!monthlyUsage[key]) {
            monthlyUsage[key] = 0;
        }
        monthlyUsage[key] += item[config.yField];
    });
    
    return monthlyUsage;
}
