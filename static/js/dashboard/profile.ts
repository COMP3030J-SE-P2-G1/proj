import { BarChart } from 'echarts/charts';
import { initElectricityPriceChart, initElectricityUsageChart } from '../chart/chart.ts';
import * as echarts from 'echarts/core';
import * as PROFILE_API from '../api/profile.ts';
import * as Chart from '../chart/chart.ts';
import type { Aggregate } from '../api/types.ts';

// TODO start from and end from selection

function bindEvents(): void {
    document.getElementById('profileForm').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent the default form submission

        const form = e.target;
        const formData = new FormData(form);

        try {
            const response = await fetch('/dashboard/create_profile', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                if (response.status === 400) {
                    // Assuming the server responds with JSON containing the error details
                    const errorData = await response.json();

                    // Clear previous errors
                    document.querySelectorAll('.form-group .alert-error').forEach(el => {
                        el.remove();
                    });

                    // Insert error messages into the form
                    Object.entries(errorData.errors).forEach(([fieldName, errorMessage]) => {
                        const inputElement = document.querySelector(`[name="${fieldName}"]`);
                        const errorElement = document.createElement('div');
                        errorElement.className = 'alert alert-error shadow-lg mt-1 p-2 text-xs';
                        errorElement.style.backgroundColor = '#FECACA';
                        errorElement.style.color = '#B91C1C';
                        errorElement.textContent = errorMessage;

                        if (inputElement) {
                            inputElement.classList.add('input-error'); // Highlight the input
                            inputElement.parentElement.appendChild(errorElement);
                        }
                    });
                }
            } else {
                // Handle success
                window.location.reload();
            }

        } catch (error) {
            // Handle error (e.g., keep the dialog open, display error messages)
            console.error('Error:', error);
            alert('Error: ' + error.message); // Simplified error handling for demonstration
        }
    });

    bindActiveTabEvents('tab1');
    bindActiveTabEvents('tab2');
    bindActiveTabEvents('tab3');
}


function bindActiveTabEvents(tabId: string): void {
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent the default action if necessary
            // console.log(`${tabId} was clicked`);
            if (!this.classList.contains('tab-active')) {
                // Find the currently active tab and remove 'tab-active' class
                const activeTab = document.querySelector('.tab.tab-active');
                if (activeTab) {
                    activeTab.classList.remove('tab-active');
                }
                // Add 'tab-active' class to the clicked tab
                this.classList.add('tab-active');
            }
            const aggregate = this.getAttribute("data-aggregate") ?? "day";
            // Add your code here to do what you want when the tab is clicked
            initCharts(aggregate);
        });
    };
}


function initCharts(aggregate: Aggregate = "year") {
    if (window.profile_chart0) window.profile_chart0.dispose();
    if (window.profile_chart1) window.profile_chart1.dispose();

    const startTimeElm = document.getElementById("start_date");
    const endTimeElm = document.getElementById("end_date");
    let startTime = null;
    let endTime = null;
    if (startTimeElm) {
        const value = startTimeElm.value;
        if (value != "") {
            startTime = new Date(value);
        }
    }
    if (endTimeElm) {
        const value = endTimeElm.value;
        if (value != "") {
            endTime = new Date(value);
        }
    }
    
    initChart0();
    initChart1();
    
    async function initChart0() {
        const chart0Elm = document.getElementById("chart0");
        if (!chart0Elm) { console.error("Cannot find HTML element #chart0"); return;}
        PROFILE_API.getProfile(1).then(profile => {
            const chart0dataSources = [
                new Chart.ProfileUsageDataSource(profile, {
                    startTime: startTime,
                    endTime: endTime,
                    aggregate: aggregate,
                    initChartOptions: {
                        type: {
                            type: "pie",
                            xField: 0,
                            yField: 1,
                            format: Chart.getAdaptivePieChartFormat(aggregate)
                        }
                    }
                })
            ];
            window.profile_chart0 = Chart.initDynamicTimelyChart(
                chart0Elm,
                chart0dataSources,
                {
                    dateset: {
                        source: [],
                        sourceHeader: false
                    },
                    title: {
                        text: 'Electricity Usage',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    series: [
                        {
                            type: 'pie',
                            radius: '50%',
                            encode: {
                                itemName: 0,
                                value: 1
                            },
                            tooltip: {
                                valueFormatter: value => `${parseFloat(value).toFixed(2)} kWh`
                            },
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ],
                    animation: false,
                }
            )
        })
    }

    async function initChart1() {
        const chart1Elm = document.getElementById("chart1");
        if (!chart1Elm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
        PROFILE_API.getProfile(1).then(
            profile => {
                const chart1dataSources = [
                    new Chart.ProfileSolarDataSource(profile, {
                        startTime: startTime,
                        endTime: endTime,
                        aggregate: aggregate,
                    }),
                    new Chart.ProfileUsageDataSource(profile, {
                        startTime: startTime,
                        endTime: endTime,
                        aggregate: aggregate,
                    })
                ];
                const optionTemplate = {
                    dateset: [
                        {
                            source: [],
                            sourceHeader: false
                        },
                        {
                            source: [],
                            sourceHeader: false
                        }
                    ],
                    title: {
                        left: 'center',
                        text: 'Generated Solar Energy vs Electricity Usage'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'time',
                        axisLabel: {
                            formatter: Chart.getAdaptiveFormatter(aggregate)
                        }
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '100%'],
                        axisLabel: {
                            inside: true
                        },
                        max: function (value) {
                            return value.max * 1.5;
                        }
                    },
                    grid: {},
                    series: [
                        {
                            name: "Solar",
                            encode: { x: 0, y: 1 },
                            type: "bar",
                            stack: "jntm",
                            emphasis: {
                                focus: 'series'
                            },
                            tooltip: {
                                valueFormatter: value => `${parseFloat(value).toFixed(2)} kWh`
                            },
                            datasetIndex: 0
                        },
                        {
                            name: "Usage",
                            encode: { x: 0, y: 1 },
                            type: "bar",
                            stack: "jntm",
                            emphasis: {
                                focus: 'series'
                            },
                            itemStyle: {
                                borderRadius: [5, 5, 0, 0]
                            },
                            tooltip: {
                                valueFormatter: value => `${parseFloat(value).toFixed(2)} kWh`
                            },
                            datasetIndex: 1,
                        }
                    ],
                    animation: false,
                };
                
                if (aggregate == "day") {
                    optionTemplate['dataZoom'] = [
                        {
                            type: 'inside',
                            start: 0,
                            end: 10
                        },
                        {
                            start: 0,
                            end: 10
                        }
                    ];   
                }
                
                window.profile_chart1 = Chart.initDynamicTimelyChart(
                    chart1Elm,
                    chart1dataSources,
                    optionTemplate
                )       
            }
        )
    }
}


export default function onLoad() {
    bindEvents();
    initCharts();
}
