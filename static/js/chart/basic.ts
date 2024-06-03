import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { DataSource, DataSourceTimelyData } from './datasource.ts';


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


/**
 * Asynchronous Loading + Dynamic Update
 * interval: Interval in milliseconds to fetch data, default is 0ms
 *
 * A tip for debugging chart:
 *   1. set the function result to window.chart
 *   2. when you see the chart is fully, loaded. Then console.log(window.chart)
 */
export function initDynamicChart<D, T>(
    elm: HTMLElement,
    optionTemplate: ChartOption,
    dataSources: DataSource<D, T>[]
): echarts.ECharts {
    const chart = echarts.init(elm);
    chart.setOption(optionTemplate);
    
    if (dataSources.length > 0) {
        chart.showLoading('default', {
            text: 'Fetching data...\nFirst time fetching needs time.',
            maskColor: 'rgba(255, 255, 255, 0.6)'
        });

        let index = 0;
        const fetchPromises: Promise<void>[] = [];
        
        dataSources.forEach(dataSource => {
            dataSource.bindChart(chart);
            dataSource.index = index;
            
            fetchPromises.push(dataSource.startFetching());
            
            index += 1;
        });

        Promise.all(fetchPromises).then(() => {
            chart.hideLoading();
        }).catch(error => {
            console.error("An error occurred while fetching data: ", error);
            chart.hideLoading();
        });
    }

    return chart;
}

export function initDynamicTimelyChart(
    elm: HTMLElement,
    dataSources: DataSourceTimelyData[],
    optionTemplate: ChartOption = getDefaultOptionTemplate(undefined, dataSources),
) {
    return initDynamicChart(elm, optionTemplate, dataSources);
}


export function getDefaultOptionTemplate(title: string | undefined, dataSources: DataSourceTimelyData[]): ChartOption {
    title = title ?? 'Demo Chart';
    const types = dataSources.map(dataSource => dataSource.initChartOptions.type)
    const dataset = types.map(_ => {
        return {
            source: [],
            sourceHeader: false,
        };
    });
    let template: ChartOption = {
        dataset: dataset,
        title: {
            text: title
        },
        xAxis: {
            type: 'time'
        },
        yAxis: {},
        series: [],
        animation: false // disable animation to get the best performance for large data
    };
    
    let series: Array<any> = [];
    let index = 0;
    types.forEach(type => {
        const t = type ? type.type : "line";
        let option = undefined;
        if (t == "line" || t == "bar") {
            option = {
                encoding: { x: 0, y: 1},
                type: t,
                datasetIndex: index
            };
        } else { // pie chart 
            option = {
                type: t,
                encode: {
                    itemName: 0,
                    value: 1
                },
                datasetIndex: index
            }
        }
        series.push(option);
        index += 1;
    });
    
    template['series'] = series;
    return template;
}

