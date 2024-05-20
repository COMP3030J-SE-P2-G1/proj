import { BarChart } from 'echarts/charts';
import { initElectricityPriceChart, initElectricityUsageChart } from '../chart/chart.ts';
import * as echarts from 'echarts/core';
import * as PROFILE_API from '../api/profile.ts';
import * as Chart from '../chart/chart.ts';
import type { Aggregate } from '../api/types.ts';

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
    
    initChart0();
    initChart1();
    
    async function initChart0() {
        const chart0Elm = document.getElementById("chart0");
        if (!chart0Elm) { console.error("Cannot find HTML element #chart0"); return;}
        PROFILE_API.getProfile(1).then(profile => {
            const chart0dataSources = [
                new Chart.ProfileUsageDataSource(profile, {
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
                        aggregate: aggregate,
                    }),
                    new Chart.ProfileUsageDataSource(profile, {
                        aggregate: aggregate,
                    })
                ];
                const optionTemplate = {
                    dateset: [
                        {
                            source: []
                        },
                        {
                            source: []
                        }
                    ],
                    visualMap: {
                        show: false,
                        type: 'continuous',
                        seriesIndex: 0,
                        min: 0,
                    },
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


let map: google.maps.Map;
let marker: google.maps.Marker;
let geocoder: google.maps.Geocoder;

function initMap(): void {
    const lat: number = parseFloat((<HTMLInputElement>document.getElementById('lat')).value) || 53.3067;
    const lon: number = parseFloat((<HTMLInputElement>document.getElementById('lon')).value) || -6.2269;

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: lat, lng: lon },
        zoom: 8
    });

    marker = new google.maps.Marker({
        map: map,
        position: map.getCenter()
    });

    geocoder = new google.maps.Geocoder();

    map.addListener('click', function (event: google.maps.MouseEvent) {
        updateMarker(event.latLng.lat(), event.latLng.lng());
    });
}

function updateMarker(lat: number, lng: number): void {
    const location = { lat: lat, lng: lng };
    map.setCenter(location);
    marker.setPosition(location);

    // Fill lon and lat input fields with the latitude and longitude values
    (<HTMLInputElement>document.getElementById('lon')).value = lng.toString();
    (<HTMLInputElement>document.getElementById('lat')).value = lat.toString();
}

function geocodeAddress(event: Event): void {
    event.preventDefault(); // Prevent default form submission behavior

    const address: string = (<HTMLInputElement>document.getElementById('address')).value;

    geocoder.geocode({ 'address': address }, function (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            updateMarker(location.lat(), location.lng());
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

declare global {
    interface Window {
        initMap: () => void;
    }
}


export default function onLoad() {
    window.initMap = initMap;
    bindEvents();
    initCharts();
    initMap();
}
