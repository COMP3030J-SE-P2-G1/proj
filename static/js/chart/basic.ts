import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

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
    TransformComponent
} from 'echarts/components';

// Types
import {
    type PieSeriesOption,
    type BarSeriesOption,
    type LineSeriesOption} from 'echarts/charts';
import type {
    TitleComponentOption, 
    TooltipComponentOption,
    GridComponentOption,
    DatasetComponentOption
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
>;

// Register the required components
echarts.use([
    LineChart,
    BarChart,
    PieChart,
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
