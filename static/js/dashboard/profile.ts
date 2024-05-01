import { BarChart } from 'echarts/charts';
import { initElectricityPriceChart, initElectricityUsageChart } from '../chart/chart.ts';
import * as echarts from 'echarts/core';

function bindEvents(): void {
    document.getElementById('profileForm').addEventListener('submit', async function (e) {
        console.log("hello1")
        e.preventDefault(); // Prevent the default form submission

        const form = e.target;
        const formData = new FormData(form); console.log("hello2")

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
                        errorElement.textContent = <string>errorMessage;

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
}

function initCharts() {
    const electricityUsageChartElm = document.getElementById("cock_chart");
    if (!electricityUsageChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityPriceChart(electricityUsageChartElm, null, null, {
        fetchDataStep: 360,
        optionTemplate: {
            dateset: {
                source: []
            },
            visualMap: {
                show: false,
                type: 'continuous',
                seriesIndex: 0,
                min: 0,
            },
            title: {
                left: 'center',
                text: 'Gradient along the y axis'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'time'
            },
            yAxis: {},
            grid: {},
            series: [
                {
                    encode: { x: 0, y: 1 },
                    type: "line",
                }
            ],
            animation: false,
        }
    })

    const electricityUsagePieChartElm = document.getElementById("p_chart");
    if (!electricityUsagePieChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityUsageChart(electricityUsagePieChartElm, 1, null, null, {
        type: {
            type: "pie",
            xField: 0,
            yField: 1,
            format: "yyyy-MMMM"
        },
        optionTemplate: {
            dateset: {
                source: []
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
    })
}


export default function onLoad() {
    bindEvents();
    initCharts();
}
