import { BarChart } from 'echarts/charts';
import { initElectricityPriceChart, initElectricityUsageChart } from '../chart/chart.ts';
import * as echarts from 'echarts/core';

function bindEvents(): void {
    document.getElementById('profileForm').addEventListener('submit', async function (e) {
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

    activeTabEvents('tab1');
    activeTabEvents('tab2');
    activeTabEvents('tab3');
}


function activeTabEvents(tabId: string): void {
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent the default action if necessary
            console.log(`${tabId} was clicked`);
            if (!this.classList.contains('tab-active')) {
                // Find the currently active tab and remove 'tab-active' class
                const activeTab = document.querySelector('.tab.tab-active');
                if (activeTab) {
                    activeTab.classList.remove('tab-active');
                }
                // Add 'tab-active' class to the clicked tab
                this.classList.add('tab-active');
            }
// Add your code here to do what you want when the tab is clicked
        });
    };
}


function initCharts() {
    const electricityUsagePieChartElm = document.getElementById("chart0");
    if (!electricityUsagePieChartElm) { console.error("Cannot find HTML element #chart0"); return;}
    initElectricityUsageChart(electricityUsagePieChartElm, 1, null, null, "month", {
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
    });

    const electricityPriceChartElm = document.getElementById("chart1");
    if (!electricityPriceChartElm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
    initElectricityPriceChart(electricityPriceChartElm, null, null, null, "day", {
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
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                max: function (value) {
                    return value.max * 1.5;
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 10
                },
                {
                    start: 0,
                    end: 10
                }
            ],
            grid: {},
            series: [
                {
                    encode: { x: 0, y: 1 },
                    type: "bar",
                }
            ],
            animation: false,
        }
    });
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

window.initMap = initMap;

document.addEventListener('DOMContentLoaded', function () {
    // Your additional initialization logic here
});


export default function onLoad() {
    bindEvents();
    initCharts();
    initMap();
}
