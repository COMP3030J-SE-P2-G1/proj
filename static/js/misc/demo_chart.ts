import { ready, dateAdd } from '../lib/utils.ts';
import { initDynamicChart, StateType } from '../lib/chart.ts';
import type { State } from '../lib/chart.ts';
import type { Solar } from '../types/api.ts';
import * as PROFILE_API from '../api/profile.ts';


async function demoInitDynamicChart() {
    const elm = document.getElementById("initDynamicChart")!;
    let profile = await PROFILE_API.getProfile(1);

    initDynamicChart<Solar, string>(
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
        profile.start_time,
        async state => {
            const startTime = dateAdd(new Date(state.value), 1); // FIXME
            const endTime = dateAdd(startTime, 15);
            return PROFILE_API.getSolar(profile.id, startTime, endTime);
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
            const newState: State<string> = Object.assign({}, state);
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
