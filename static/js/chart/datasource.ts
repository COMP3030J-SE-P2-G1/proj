import * as echarts from 'echarts/core';
import type {
    DatasetComponentOption
} from 'echarts/components';

import { format } from 'date-fns';
import { Mutex } from 'async-mutex';

import type { ChartOption } from './basic.ts';
import type { NullableTime, TimelyArrayData, Aggregate, Profile } from '../api/types.ts';
import { dateAdd, daysBetweenNull, hoursBetweenNull } from '../lib/utils.ts';
import * as PROFILE_API from '../api/profile.ts';
import * as DATA_API from '../api/data.ts';

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

export type OverrideOptionFuncType<D> = (data: D[], prevData: D[] | null, prevOption: ChartOption, index: number) => ChartOption;


function defaultShouldStopFetchingFunc<T>(state: State<T>, _prevState: State<T> | null): boolean {
    return state.state == StateType.stop? true : false;
}


export class DataSource<D, T> {
    protected fetchDataFunc: (state: State<T>) => Promise<D[]>;
    protected updateStateFunc: (state: State<T>, data: D[]) => State<T>;
    protected overrideOptionFunc: OverrideOptionFuncType<D>;
    protected shouldStopFetchingFunc: (state: State<T>, prevState: State<T> | null) => boolean = (state, _prevState) => {
        return state.state == StateType.stop? true : false;
    }
    protected interval: number = 0;
    
    private _chart: echarts.ECharts | null = null;
    private _curState: State<T>;
    private _prevState: State<T> | null = null;
    private _prevData: D[] | null = null;
    private _data: D[] | null = null;
    private _index: number  = 0;
    set index(index: number) {
        this._index = index;
    }
    
    constructor(
        initialStateValue: T,
        fetchDataFunc: (state: State<T>) => Promise<D[]>,
        interval: number = 0,
        updateStateFunc: (state: State<T>, data: D[]) => State<T>,
        overrideOptionFunc: OverrideOptionFuncType<D>,
        shouldStopFetchingFunc:  (state: State<T>, prevState: State<T> | null) => boolean = (state, prevState) => defaultShouldStopFetchingFunc<T>(state, prevState),
        chart: echarts.ECharts | null = null,
        index: number = 1,
    ) {
        this._curState = { state: StateType.initial, value: initialStateValue };
        this.interval = interval;
        this.fetchDataFunc = fetchDataFunc;
        this.updateStateFunc = updateStateFunc;
        this.overrideOptionFunc = overrideOptionFunc;
        this.shouldStopFetchingFunc = shouldStopFetchingFunc;
        if (chart) this._chart = chart;
        this.index = index;
    }

    public bindChart(chart: echarts.ECharts) {
        this._chart = chart;
    }

    public startFetching() {
        if (!this._chart) throw new Error("`this._chart` is null!");
        if (this._index == undefined || this._index == null)
            throw new Error("`this._order` is null!");
        
        const mutex = new Mutex();
        
        const updateData = () => {
            this.fetchDataFunc(this._curState)
                .then(async (fetchedData) => {
                    if (!this._chart) throw new Error("`this._chart` is null!");
                    if (this._index == undefined || this._index == null)
                        throw new Error("`this._order` is null!");
                    this._chart.hideLoading();

                    if (!this._prevData) {
                        this._prevData = this._data;  
                    } else {
                        this._prevData = this._prevData.concat(this._data!);
                    }
                    this._data = fetchedData;
                    this._prevState = this._curState;
                    this._curState = this.updateStateFunc(this._curState, this._data);

                    const release = await mutex.acquire();
                    try {
                        this._chart.setOption(
                            this.overrideOptionFunc(
                                this._data,
                                this._prevData,
                                this._chart.getOption(),
                                this._index
                            )
                        );
                    } finally {
                        release();
                    }

                    if (this.shouldStopFetchingFunc(this._curState, this._prevState)) {
                        return;
                    }
                
                    setTimeout(updateData, this.interval);
                })
                .catch(error => {
                    console.error("Failed to fetch data: ", error);
                    
                    if (!this._chart) throw new Error("`this._chart` is null!");
                    this._chart.hideLoading();
                });
        };
        
        updateData();
    }
}

/* See initDynamicChart function to get a better understanding of it. */
export type InitChartOptions<D, T> = {
    /* It doesn't make sense on its alone. It is used by other options.*/
    type: ChartTypeOption,
    /* Initial State Value. State is used for determining things like whether data fetching should stop. */
    initialStateValue: T,
    /* It doesn't make sense on its alone. It is used by other options.*/
    fetchDataStep: number, // number of dates
    /* Fetch Data. Data is passed to Override Option. */
    fetchDataFunc: (state: State<T>) => Promise<D[]>,
    /* Update State after getting data */
    updateStateFunc: (state: State<T>, data: D[]) => State<T>,
    /* Override Option defined in optionTemplate. Basically we override it by doing `chart.setOption` again. */
    overrideOptionFunc: (data: D[], prevData: D[] | null, prevOption: ChartOption, index: number) => ChartOption,
    /* Time of milliseconds between two consequent requests */
    interval: number,
    /* Whether we should stop fetching data. */
    shouldStopFetchingFunc: (state: State<T>, prevState: State<T> | null) => boolean
}

type TimelyDataInitChartOptions = Partial<Omit<InitChartOptions<TimelyArrayData, NullableTime>, "fetchDataFunc">>;

export class DataSourceTimelyData extends DataSource<TimelyArrayData, NullableTime> {
    public readonly initChartOptions: TimelyDataInitChartOptions;
    
    constructor(
        startTime: Date | null,
        endTime: Date | null,
        fetchDataFunc: (state: State<NullableTime>) => Promise<TimelyArrayData[]>,
        initChartOptions: TimelyDataInitChartOptions = {},
        chart: echarts.ECharts | null = null,
    ) {
        const {
            initialStateValue = startTime ? startTime.toISOString() : null,
            fetchDataStep = getDefaultFetchDataStep(daysBetweenNull(startTime, endTime)),
            overrideOptionFunc = getDefaultOverrideOption<TimelyArrayData>(initChartOptions.type),
            updateStateFunc = defaultUpdateStateFunction(endTime, fetchDataStep),
            interval,
            shouldStopFetchingFunc
        } = initChartOptions;
        
        super(
            initialStateValue,
            fetchDataFunc,
            interval,
            updateStateFunc,
            overrideOptionFunc,
            shouldStopFetchingFunc,
            chart
        )
        
        this.initChartOptions = initChartOptions;
    }
}

const DEFAULT_CHART_TYPE_OPTION: ChartTypeOption = {
    type: 'line',
    xField: 0,
    yField: 1
};

// TODO
function getDefaultOverrideOption<D extends { [key: string ]: any }>(type: ChartTypeOption | undefined): OverrideOptionFuncType<D> {
    function getOverrideDataSetOption(
        prevDataset: DatasetComponentOption | Array<DatasetComponentOption> | undefined,
        overrideDatasetOption: DatasetComponentOption,
        index: number
    ): ChartOption {
        let newDataset = prevDataset ?? overrideDatasetOption;
        if (!(newDataset instanceof Array)) {
            newDataset = [newDataset];
        }
        // In JavaScript, we don't need array out of bounds check, since it will
        // automatically expand the array for us.
        newDataset[index] = overrideDatasetOption;
            
        return {
            dataset: newDataset
        };
    }
    
    type = type ?? DEFAULT_CHART_TYPE_OPTION;
    if (type.type == 'line' || type.type == 'bar') {
        return (data, prevData, prevOption, index) => {
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
            return getOverrideDataSetOption(prevDataset, overrideDatasetOption, index);
        };
    } else { // pie chart
        const usageData: StringNumberDict = {};
        return (data, _prevData, prevOption, index) => {
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
            return getOverrideDataSetOption(prevDataset, overrideDatasetOption, index);
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

function defaultUpdateStateFunction<D extends TimelyArrayData>(
    endTime: Date | null,
    fetchDataStep: number
) {
    return (state: State<NullableTime>, data: D[]) => {
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
    } ;
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


////////////////////////
// Common DataSources //
////////////////////////

function aggregate2hours(aggregate: Aggregate) {
    switch (aggregate) {
        case "hour":
            return 1;
        case "day":
            return 24;
        case "month":
            return 24 * 30;
        case "year":
            return 24 * 30 * 360;
    }
}

function getDefaultFetchDataDays(aggregate: Aggregate) {
    const base = 30;
    return base * aggregate2hours(aggregate);
}

export type InitOptions = {
    startTime: Date | null,
    endTime: Date | null,
    spanHours: number | null,
    aggregate: Aggregate,
    initChartOptions: TimelyDataInitChartOptions,
    chart: echarts.ECharts | null,
}

export class ProfileDataSource extends DataSourceTimelyData {
    constructor(
        profile: Profile,
        initOptions: Partial<InitOptions> = {},
        fetchDataFunc: (
            profileId: number,
            startTime: Date | null,
            endTime: Date | null,
            span_hours: number | null,
            aggregate: Aggregate
        ) => Promise<TimelyArrayData[]>
    ) {
        const {
            startTime = null,
            endTime = null,
            spanHours = null,
            aggregate = "day",
            initChartOptions = {},
            chart = null,
        } = initOptions;
        
        const gStartTime = startTime ? startTime : new Date(profile.start_time);
        const gEndTime = endTime ? endTime : new Date(profile.end_time);
        
        initChartOptions.initialStateValue = gStartTime.toISOString();
        initChartOptions.fetchDataStep = initChartOptions.fetchDataStep
            ?? getDefaultFetchDataStep(
                daysBetweenNull(gStartTime, gEndTime),
                getDefaultFetchDataDays(aggregate)
            );
        
        const fetchDataStep = initChartOptions.fetchDataStep;
        
        super(
            startTime,
            endTime,
            (state: State<NullableTime>) => {
                const startTime = state.value ? new Date(state.value) : null;
                let endTime = null;
                if (startTime) {
                    const ed = dateAdd(startTime, fetchDataStep);
                    endTime = gEndTime > ed ? ed : gEndTime;
                }
                return fetchDataFunc(profile.id, startTime, endTime, null, aggregate);
            },
            initChartOptions,
            chart
        )
    }    
}


export class ProfileUsageDataSource extends ProfileDataSource {
    constructor(
        profile: Profile,
        initOptions: Partial<InitOptions> = {}
    ) {
        super(
            profile,
            initOptions,
            PROFILE_API.getUsage
        )
    }
}

export class ProfileSolarDataSource extends ProfileDataSource {
    constructor(
        profile: Profile,
        initOptions: Partial<InitOptions> = {}
    ) {
        super(
            profile,
            initOptions,
            PROFILE_API.getSolar
        )
    }
}

export class ProfileSavingDataSource extends ProfileDataSource {
    constructor(
        profile: Profile,
        initOptions: Partial<InitOptions> = {}
    ) {
        super(
            profile,
            initOptions,
            PROFILE_API.getSaving
        )
    }
}


export class ElectricityPriceDataSource extends DataSourceTimelyData {
    constructor(initOptions: Partial<InitOptions> = {}) {
        const {
            startTime = null,
            endTime = null,
            spanHours = null,
            aggregate = "day",
            initChartOptions = {},
            chart = null,
        } = initOptions;

        const gEndTime = endTime;
        let calSpanHours = spanHours ?? hoursBetweenNull(startTime, endTime);
        const spanDays = calSpanHours ? calSpanHours / 24 : null; 
        
        initChartOptions.fetchDataStep = initChartOptions.fetchDataStep
            ?? getDefaultFetchDataStep(spanDays, getDefaultFetchDataDays(aggregate));
        
        const fetchDataStep = initChartOptions.fetchDataStep;
        
        super(
            startTime,
            endTime,
            (state: State<NullableTime>) => {
                const startTime = state.value ? new Date(state.value) : null;
                let endTime = null;
                if (startTime) {
                    const ed = dateAdd(startTime, fetchDataStep);
                    endTime = (!gEndTime || gEndTime < ed) ? gEndTime : ed;
                }
                calSpanHours = calSpanHours ?? (endTime ? null : fetchDataStep * 24);
                return DATA_API.getElectricityPrice(startTime, endTime, calSpanHours, aggregate) as Promise<TimelyArrayData[]>;
            },
            initChartOptions,
            chart
        )
    }
}

