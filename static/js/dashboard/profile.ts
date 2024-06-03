import * as PROFILE_API from '../api/profile.ts';
import * as Chart from '../chart/chart.ts';
import type { Aggregate, Profile } from '../api/types.ts';

// TODO start from and end from selection

function bindEvents(): void {
    document.getElementById('profileForm')?.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent the default form submission

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const response = await fetch('/dashboard/create_profile', {
                method: 'POST',
                body: formData
            })
            
            if (response.ok) {
                response.json().then(newProfile => {
                    (document.getElementById("profile_modal") as HTMLDialogElement)?.close();
                    changeProfile(newProfile.id);
                });
            } else {
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
    
    // start time and end time elements
    const startTimeElm = document.getElementById("start_date") as HTMLInputElement;
    const endTimeElm = document.getElementById("end_date") as HTMLInputElement;
    const timeElms = [startTimeElm, endTimeElm];
    timeElms.forEach(elem => {
        // Note that events can only be triggered by user. Change caused by js won't
        // trigger events.
        elem?.addEventListener("change", _ => {
            initChartsAwaringAggregate();
        });
    });

    // select profile element
    const selectProfileElm = document.getElementById("selectProfile") as HTMLSelectElement;
    if (selectProfileElm) {
        selectProfileElm.addEventListener("change", _ => {
            initChartsAwaringAggregate();
        })
    }
}

function changeProfile(profile_id: number) {
    reinitializeSelectProfileElm(profile_id);
    initChartsAwaringAggregate(profile_id);
}

function reinitializeSelectProfileElm(select: number | string) {
    const selectProfileElm = document.getElementById("selectProfile") as HTMLSelectElement;
    if (!selectProfileElm) {
        console.error("Cannot find `selectProfile` element!");
        return;
    }
    PROFILE_API.getProfiles().then(profiles => {
        let selectInNewProfiles = false;
        const optionElms = profiles.map(profile => {
            const optionElm = document.createElement("option");
            if (select && (`${select}` == `${profile.id}`)) selectInNewProfiles = true;
            optionElm.setAttribute("value", `${profile.id}`);
            optionElm.textContent = profile.name;
            return optionElm;
        });
        selectProfileElm.replaceChildren(...optionElms);
        if (selectInNewProfiles) {
            selectProfileElm.value = `${select}`;
        }
    });
}

function initChartsAwaringAggregate(profile_id: number | null = null) {
    const activeTabElm = document.querySelector('.tab.tab-active');
    if (activeTabElm) {
        const aggregate = activeTabElm.getAttribute("data-aggregate") ?? "day";
        initCharts(aggregate as Aggregate, profile_id);
    }
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
            initCharts(aggregate as Aggregate);
        });
    };
}

function showLoadingOverlay(parentElm: HTMLElement) {
    const overlay = document.createElement('div');
    // loading-overlay class doesn't do anything, it's just an identifier
    overlay.className = 'loading-overlay inset-0 flex justify-center items-center';
    
    const loadingIndicator = document.createElement('span');
    loadingIndicator.className = 'loading loading-dots loading-md';
    
    overlay.appendChild(loadingIndicator);
    
    parentElm.appendChild(overlay);
    console.log(parentElm);
}

function removeLoadingOverlay(parentElm: HTMLElement) {
    const overlay = parentElm.querySelector('.loading-overlay');
    if (overlay) {
        parentElm.removeChild(overlay);
    }
}


function countDigits(n: number) {
    return n.toString().length; // including `-` prefix if number < 0; also includes `.` if float
}


async function setTotalElectricityUsageLabel(profile: Profile) {
    const labelElm = document.getElementById("yearly-usage-sum");
    if (!labelElm) {
        console.error("Cannot find element with id 'yearly-usage-sum'!");
        return;
    }
    labelElm.textContent = "";
    showLoadingOverlay(labelElm);
    PROFILE_API.getUsage(
        profile.id,
        new Date(profile.start_time),
        new Date(profile.end_time),
        null,
        "year"
    ).then(usages => {
        removeLoadingOverlay(labelElm);

        const sum = usages.reduce(
            (acc, cur) => acc + (cur[1] as number),
            0
        );
        if (countDigits(sum)>6){
            const temp = sum * Math.pow(10, -6)
            labelElm.textContent = `${temp.toFixed(3)} GWh`;
        }
        else if(countDigits(sum)>3){
            const temp = sum * Math.pow(10, -3)
            labelElm.textContent = `${temp.toFixed(3)} MWh`;
        }
        else{
            labelElm.textContent = `${sum.toFixed(3)} kWh`;
        }
    });
}


async function setTotalSavingLabel(profile: Profile) {
    const labelElm = document.getElementById("saving");
    if (!labelElm) {
        console.error("Cannot find element with id 'saving'!");
        return;
    }
    labelElm.textContent = "";
    showLoadingOverlay(labelElm);
    PROFILE_API.getSaving(
        profile.id,
        new Date(profile.start_time),
        new Date(profile.end_time),
        null,
        "year"
    ).then(saving => {
        removeLoadingOverlay(labelElm);
        const sum = saving.reduce(
            (acc, cur) => acc + (cur[1] as number),
            0
        );
        const formattedAmount = sum.toFixed(3)
        labelElm.textContent = `${formattedAmount.toLocaleString()} €`;
    });
}

async function setReduceCO2Label(profile: Profile) {
    const labelElm = document.getElementById("reduce_co2");
    if (!labelElm) {
        console.error("Cannot find element with id 'saving'!");
        return;
    }
    labelElm.textContent = "";
    showLoadingOverlay(labelElm);
    PROFILE_API.getSolar(
        profile.id,
        new Date(profile.start_time),
        new Date(profile.end_time),
        null,
        "year"
    ).then(solar => {
        removeLoadingOverlay(labelElm);

        const sum = solar.reduce(
            (acc, cur) => acc + (cur[1] as number),
            0
        );
        const formattedCO2 = (sum * 0.7).toFixed(3)
        labelElm.textContent = `${formattedCO2} kg`;
    });
}

/**
 * @param profileId. We allow pass profileId here since the way of using elem.value
 * seems to have some delay and we possibly get the old value.
 */
function initCharts(aggregate: Aggregate = "year", profileId: number | null = null) {
    if (window.profile_chart0) window.profile_chart0.dispose();
    if (window.profile_chart1) window.profile_chart1.dispose();

    const startTimeElm = document.getElementById("start_date") as HTMLInputElement;
    const endTimeElm = document.getElementById("end_date") as HTMLInputElement;
    let startTime: Date | null = null;
    let endTime: Date | null = null;
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

    if (!profileId) {
        let selectedProfileElm = document.getElementById("selectProfile") as HTMLSelectElement;
        if (!selectedProfileElm || selectedProfileElm.value == "") {
            console.log("There is no profile in this user account, so there won't be charts.");
            return;
        } else {
            profileId = parseInt(selectedProfileElm.value);
        }
    }

    PROFILE_API.getProfile(profileId).then(profile => {
        initChart0(profile);
        initChart1(profile);

        // update start time and end time elements if both of them are null
        if (startTimeElm && endTimeElm && !(startTime || endTime)) {
            const rawStartTime = new Date(profile.start_time);
            const rawEndTime = new Date(profile.end_time);
            const startTimeStr = rawStartTime.toISOString().split('T')[0];
            const endTimeStr = rawEndTime.toISOString().split('T')[0];
                
            startTimeElm.value = startTimeStr;
            endTimeElm.value = endTimeStr;

            const elems = [startTimeElm, endTimeElm];
            elems.forEach(elem => {
                elem.setAttribute("min", startTimeStr);
                elem.setAttribute("max", endTimeStr);
            });
            // endTimeElm.value = profile.end_time;
        }

        // update labels
        setTotalElectricityUsageLabel(profile);
        setTotalSavingLabel(profile);
        setReduceCO2Label(profile);
    })
    
    async function initChart0(profile: Profile) {
        const chart0Elm = document.getElementById("chart0");
        if (!chart0Elm) { console.error("Cannot find HTML element #chart0"); return;}
        if (aggregate == "day") {
            chart0Elm.classList.add("hidden");
            return;
        } else {
            chart0Elm.classList.remove("hidden");
        }
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
                dataset: {
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
        
    }

    async function initChart1(profile: Profile) {
        const chart1Elm = document.getElementById("chart1");
        if (!chart1Elm) { console.error("Cannot find HTML element #electricity-usage-chart."); return;}
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
            }),
            new Chart.ProfileSavingDataSource(profile, {
                startTime: startTime,
                endTime: endTime,
                aggregate: aggregate,
            })
        ];
        const optionTemplate = {
            dataset: [
                {
                    source: [],
                    sourceHeader: false
                },
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
                text: 'Generated Solar Energy vs Electricity Usage vs Saving'
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
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        inside: true
                    }
                },
                {
                    type: 'value',
                    axisLabel: {
                        inside: true
                    }
                }
            ],
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
                    yAxisIndex: 0,
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
                    yAxisIndex: 0,
                    datasetIndex: 1,
                },
                {
                    name: "Saving",
                    encode: { x: 0, y: 1},
                    type: "line",
                    lineStyle: {
                        width: 3
                    },
                    emphasis: {
                        focus: "focus"
                    },
                    tooltip: {
                        valueFormatter: value => `${parseFloat(value).toFixed(2)} €`
                    },
                    yAxisIndex: 1,
                    datasetIndex: 2
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
}


export default function onLoad() {
    bindEvents();
    initCharts();
}
