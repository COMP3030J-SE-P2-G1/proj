# Chart Api Usage

[Demo Page](http://localhost:5000/misc/demo_chart)  
Demo Page Source Code: [script code](../static/js/misc/demo_chart.ts) & [html code](../templates/page/misc/demo_chart.j2)

## FAQ
1. How does it work?  
For example of `initElectricityPriceChart`:  
`initElectricityPriceChart` ([common.ts](../static/js/chart/common.ts)) -> `initDynamicTimelyChart`([basic.ts](../static/js/chart/basic.ts)) -> `initDynamicChart`([basic.ts](../static/js/chart/basic.ts)).  
To get a little insight into the sequence of process, look into `initDynamicChart` function (You don't need to fully understand it. Think of it as a flow chart.).

2. What should I pass to `initChartOptions` parameter (e.g. `initElectricityPriceChart` )?  
It is of `InitChartOptions` type. See the definition of `InitChartOptions` in [basic.ts](../static/js/chart/basic.ts) file.  

3. How the data is updated.  
First pls refer to the first FAQ question.  
This is a basic line chart optionTemplate:
```typescript
{
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
            type: 'line',
        }
    ],
    animation: false // disable animation to get the best performance for large data
}
```
The fetch data will be merged (replace) into `dataset`. When data set is an array, the first item will be replaced.







