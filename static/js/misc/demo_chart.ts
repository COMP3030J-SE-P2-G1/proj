import { ready, dateAdd } from '../lib/utils.ts';
import { initDynamicChart, StateType } from '../lib/chart.ts';
import type { State } from '../lib/chart.ts';
import type { Solar } from '../types/api.ts';

function demoInitDynamicChart() {
    const elm = document.getElementById("initDynamicChart")!;
    let minStartDate: string | null = null;

    initDynamicChart<Solar, string | null>(
        elm,
        {
            title: {
                text: "demoInitDynamicChart"
            },
            xAxis: {
                data: []
            },
            yAxis: {},
            tooltip: {},
            series: [
                {
                    name: 'demo',
                    type: 'line',
                    data: []
                }
            ]
        },
        null,
        async state => {
            let rawDate = state.value;
            // NOTE, it's better to get the initial date first and pass it as the initialData parameter
            if (rawDate == null) rawDate = "2020-01-01";
            const startDate = new Date(rawDate);
            const endDate = dateAdd(startDate, 15);
            if (state.state == StateType.initial) {
                minStartDate = startDate.toISOString();
            }
            
            const response = await fetch('/api/profile/1/solar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    start_time: startDate.toISOString(),
                    end_time: endDate.toISOString()
                })
            });
            return await response.json();
        },
        (data, prevData) => {
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
        (state, data) => {
            const newState: State<string | null> = Object.assign({}, state);
            if (data[0].id > 1000) newState.state = StateType.stop;
            newState.value = data[data.length - 1].time;
            return newState;
        },
        300
    );
}

ready(() => {
    demoInitDynamicChart();
})
