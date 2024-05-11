import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { NullableTime, TimelyArrayData } from '../api/types.ts';
import { daysBetweenNull, isDarkTheme } from '../lib/utils.ts';

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
    DataZoomComponent,
    VisualMapComponent
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
    VisualMapComponent,
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

export type OverrideOptionReturnType<D> = (data: D[], prevData: D[] | null, prevOption: ChartOption) => ChartOption;

/**
 * Asynchronous Loading + Dynamic Update
 * interval: Interval in milliseconds to fetch data, default is 0ms
 */
export function initDynamicChart<D, T>(
    elm: HTMLElement,
    optionTemplate: ChartOption,
    initialStateValue: T,
    fetchDataFunc: (state: State<T>) => Promise<D[]>,
    overrideOption: OverrideOptionReturnType<D>,
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
                
                chart.setOption(overrideOption(data, prevData, chart.getOption()));

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

/* See initDynamicChart function to get a better understanding of it. */
export type InitChartOptions<D, T> = {
    /* It doesn't make sense on its alone. It is used by other options. */
    title: string,
    /* It doesn't make sense on its alone. It is used by other options.*/
    type: ChartTypeOption,
    /* Chart option, used by `chart.setOption`. Docs: https://echarts.apache.org/en/option.html */
    optionTemplate: ChartOption,
    /* Initial State Value. State is used for determining things like whether data fetching should stop. */
    initialStateValue: T,
    /* It doesn't make sense on its alone. It is used by other options.*/
    fetchDataStep: number, // number of dates
    /* Fetch Data. Data is passed to Override Option. */
    fetchDataFunc: (state: State<T>) => Promise<D[]>,
    /* Update State after getting data */
    updateStateFunc: (state: State<T>, data: D[]) => State<T>,
    /* Override Option defined in optionTemplate. Basically we override it by doing `chart.setOption` again. */
    overrideOption: (data: D[], prevData: D[] | null, prevOption: ChartOption) => ChartOption,
    /* Time of milliseconds between two consequent requests */
    interval: number,
    /* Whether we should stop fetching data. */
    shouldStopFetchingFunc: (state: State<T>, prevState: State<T> | null) => boolean
}

function getDefaultOptionTemplate<D>(initChartOptions: Partial<InitChartOptions<D, NullableTime>>): ChartOption {
    const title = initChartOptions.title ?? 'Demo Chart';
    const type = initChartOptions.type ?? DEFAULT_CHART_TYPE_OPTION;
    
    if (type.type == 'line' || type.type == 'bar') {
        return {
            dataset: {
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

function getOverrideDataSetOption(
    prevDataset: DatasetComponentOption | Array<DatasetComponentOption> | undefined,
    overrideDatasetOption: DatasetComponentOption
): ChartOption {
    let newDataset = prevDataset ?? overrideDatasetOption;
    if (prevDataset) {
        if (newDataset instanceof Array) {
            newDataset[0] = overrideDatasetOption;
        } else {
            newDataset = overrideDatasetOption;
        }
    }
            
    return {
        dataset: newDataset
    };
}

// TODO
function getDefaultOverrideOption<D extends { [key: string ]: any }>(initChartOptions: Partial<InitChartOptions<D, NullableTime>>): OverrideOptionReturnType<D> {
    const type = initChartOptions.type ?? DEFAULT_CHART_TYPE_OPTION;
    if (type.type == 'line' || type.type == 'bar') {
        return (data, prevData, prevOption) => {
            if (prevData) data = prevData.concat(data);
            const overrideDatasetOption: DatasetComponentOption = {
                source: data.map(
                    item => [
                        item[type.xField],
                        item[type.yField]
                    ]
                )
            };

            const prevDataset = prevOption.dataset;
            return getOverrideDataSetOption(prevDataset, overrideDatasetOption);
        };
    } else { // pie chart
        const usageData: StringNumberDict = {};
        return (data, _prevData, prevOption) => {
            const newUsageSumDict = calculateUsageSum(data, type);
            for (const [key, value] of Object.entries(newUsageSumDict)) {
                if (key in usageData) {
                    usageData[key] += value;
                } else {
                    usageData[key] = value;
                }
            }

            const overrideDatasetOption: DatasetComponentOption = {
                source: Object.entries(usageData)
            };

            const prevDataset = prevOption.dataset;
            return getOverrideDataSetOption(prevDataset, overrideDatasetOption);
        };
    }
}

/**
 * Get default fetchDataStep(in day), by default it's 180 if at least one of its
 * parameters is null
 * @param days: You can use `daysBetween` function to get the days between start date
 * and end date
 */
export function getDefaultFetchDataStep(
    days: number | null = null,
    defaultDays: number = 180
) {
    const minDays = Math.ceil(defaultDays * 2 / 3 );
    defaultDays = Math.ceil(defaultDays);
    
    if (days) {
        days = Math.ceil(days);
        return days > minDays ? days : minDays;
    }
    
    return defaultDays;
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
        fetchDataStep = getDefaultFetchDataStep(daysBetweenNull(startTime, endTime)),
        fetchDataFunc,
        overrideOption = getDefaultOverrideOption<D>(initChartOptions),
        updateStateFunc = (state, data) => {
            const newState: State<NullableTime> = Object.assign({}, state);
            if (data.length == 0) {
                newState.state = StateType.stop;
                return newState;
            }
            const rawEndDate = data[data.length - 1]
            const rawStartDate = data[0][0]
            const localEndTime = new Date(rawEndDate[0]);
            const localStartTime = new Date(rawStartDate);

            if (endTime && localEndTime >= endTime) {
                newState.state = StateType.stop;
                return newState;
            }
            
            if (fetchDataStep) {
                const localSecondTime = new Date(data[1][0]);
                // tolerance: 1 hour
                const timeInterval = data.length == 1 ? null : (localSecondTime.getTime() - localStartTime.getTime()) / 3600000;
                let timeSpan = Math.ceil((localEndTime.getTime() - localStartTime.getTime()) / 3600000);
                if (timeInterval) timeSpan = timeSpan + timeInterval;
                
                if (timeSpan < fetchDataStep * 24) {
                    newState.state = StateType.stop;
                    return newState;
                }
                
            }

            const nextTime = new Date(localStartTime.getTime() + fetchDataStep * 86400000).toISOString();
            newState.value = nextTime;
            
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
