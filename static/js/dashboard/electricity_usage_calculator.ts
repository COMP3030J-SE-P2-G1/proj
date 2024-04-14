// TODO table allow user to add custom items
// This will can also deal with the problem that user can only choose one price from a list of price for a specific item

import { initInputNumber } from '../lib/input-number.ts';

type ItemConsumption = number | number[];

interface Item {
    name: string;
    consumption: ItemConsumption;
}

const jsonData = {
    "LED": 0.005,
    "Fluorescent": 0.06,
    "Kettle": 3,
    "Heaters (Electric)": 2.5,
    "Tumble dryer": 5,
    "Microwave": [0.47, 0.601, 0.705, 0.872, 1.1235, 1.411, 1.543],
    "Dishwasher": [0.34, 0.4, 0.46, 0.53, 0.59, 0.65],
    "Iron": 1,
    "Desktop computer": 0.2,
    "Refrigerator": [100, 124, 155, 194, 243, 303],
    "Electric shower": 8.5,
    "Dehumidifier": 0.18,
    "Laptop": 0.06,
    "TV": 0.2,
    "Hair dryer": 1.5,
    "Vacuum cleaner": 1.4,
    "Router": 0.01,
    "Electric Kettle": 3,
    "Toaster": 1.2,
    "Nespresso": 0.9,
    "Mobile phone": 0.002
};

const items: Item[] = Object.entries(jsonData).map(([name, consumption]) => ({
    name,
    consumption
}));

// itemName -> total money of this item
const selectedItems = new Map();

function createSidePanelItemCounterElm(itemName: string, itemNum: string, price: string): HTMLDivElement {
    const divElm = document.createElement("div");
    divElm.setAttribute("data-item", itemName);
    divElm.setAttribute("class", "flex justify-between text-sm items-center");
    
    const itemNumElm = document.createElement("div");
    const nameElm = document.createElement("span"); nameElm.textContent = `${itemName} x `;
    const numElm = document.createElement("span"); numElm.textContent = itemNum;
    itemNumElm.appendChild(nameElm); itemNumElm.appendChild(numElm);
    
    const priceElm = document.createElement("span"); priceElm.textContent = `per ${price} kWh`;
    
    divElm.appendChild(itemNumElm); divElm.appendChild(priceElm);
    return divElm;
}

function createSidePanelPromptElm(): HTMLDivElement {
    const divElm = document.createElement("div");
    divElm.setAttribute("id", "sidebar-prompt");
    divElm.setAttribute("class", "text-sm text-base-content-shadow flex justify-center");
    const subDivElm = document.createElement("div");
    subDivElm.textContent = "Select appliances to start estimation";
    divElm.appendChild(subDivElm);
    return divElm;
}

function updateItems(event: Event, inputNumElm: HTMLInputElement): void {
    const sidePanelElm = document.getElementById("side-panel")!;
    const input_number_div = inputNumElm.parentElement;
    if (!input_number_div) return;
    const rowElm = input_number_div.parentElement?.parentElement;
    if (!rowElm) return;
    const itemNum = inputNumElm.value;
    const itemName = rowElm.children[1].textContent!;
    const priceElm = rowElm.children[2].children[0];
    let price: string = "";
    if (priceElm.nodeName == "SPAN") {
        price = priceElm.textContent!;
    } else {
        price = (priceElm as HTMLSelectElement).value;
    }

    const sidePanelItemDivElm = document.querySelector(`[data-item="${itemName}"]`);
    if (sidePanelItemDivElm) {
        if (itemNum == "0") {
            sidePanelElm.removeChild(sidePanelItemDivElm);
        } else {
            const numElm = sidePanelItemDivElm.firstChild?.lastChild;
            if (numElm) {
                numElm.textContent = itemNum;
            }
        }
    } else if (itemNum != "0") {
        sidePanelElm.appendChild(createSidePanelItemCounterElm(itemName, itemNum, price));
    }

    selectedItems.set(itemName, parseInt(itemNum) * parseFloat(price));
    updateTotalPriceDisplay()
}

function getTotalHours(): number | null {
    let hours = 0;
    const totalHoursElm = document.getElementById("total-hours") as HTMLInputElement;
    const hoursPerDayElm = document.getElementById("hours-per-day") as HTMLInputElement;
    const weeksElm = document.getElementById("weeks") as HTMLInputElement;
    if (!totalHoursElm || !hoursPerDayElm || !weeksElm) {
        console.error("Hour element missing!");
        return null;
    }
    if (totalHoursElm.value != "" && totalHoursElm.value != "0") {
        hours = parseInt(totalHoursElm.value);
    } else if (totalHoursElm.value != "" && weeksElm.value != "") {
        hours = parseInt(hoursPerDayElm.value) * 7 * parseInt(weeksElm.value);
    } else {
        return 0;
    }
    return hours;
}

function calculateSum(hours: number): number  {
    return hours * [...selectedItems.values()].reduce((acc, val) => acc + val, 0);
}


function updateTotalPriceDisplay() {
    const sidePanelElm = document.getElementById("side-panel")!;
    const sidePanelItemElmCount = sidePanelElm.querySelectorAll("[data-item]").length;
    const sidePanelPromptElm = document.getElementById("sidebar-prompt");
    const hours = getTotalHours() ?? 0;
    if (sidePanelItemElmCount == 0) {
        sidePanelPromptElm!.firstElementChild!.textContent = "Select appliances to start estimation";
    } else {
        sidePanelPromptElm!.firstElementChild!.textContent = `Total: $${calculateSum(hours).toFixed(2)} (${hours} hours)`;
    }
}

function createInputNumberHTML(): string {
    return `
    <div class="input-number-div">
    <span class="input-number-decrement">–</span>
    <input class="input-number" type="text" value="0" min="0">
    <span class="input-number-increment">+</span>
    </div>
  `;
}

function populateTable() {
    const tableBody = document.getElementById('calc-table-body');
    if (!tableBody) return;

    items.forEach(item => {
        const row = document.createElement('tr');
        
        const colNumber = document.createElement('th');
        colNumber.setAttribute("class", "font-normal");
        colNumber.innerHTML += createInputNumberHTML();
        
        const colItem = document.createElement('td');
        colItem.setAttribute("class", "font-bold");
        colItem.textContent = item.name;
        
        const colPrice = document.createElement('td');
        colPrice.setAttribute("class", "text-right");
        if (typeof item.consumption == "number") {
            const span = document.createElement("span");
            span.setAttribute("class", "font-bold");
            span.textContent = `${item.consumption}`;
            
            const span1 = document.createElement("span");
            span1.textContent = "kWh";
            span1.setAttribute("class", "ml-2");
            
            colPrice.appendChild(span);
            colPrice.appendChild(span1);
            // colPrice.textContent = `${item.consumption} kWh`;
        } else {
            const selectElm = document.createElement("select");
            selectElm.setAttribute("class", "p-1.5 text-right");
            item.consumption.forEach(price => {
                const optionElm = document.createElement("option");
                optionElm.setAttribute("class", "font-bold"); // TODO not work?
                optionElm.textContent = `${price}`;
                selectElm.appendChild(optionElm);
            });
            const span = document.createElement("span");
            span.setAttribute("class", "ml-2");
            span.textContent = "kWh";
            colPrice.appendChild(selectElm);
            colPrice.appendChild(span);
        }
        
        row.appendChild(colNumber);
        row.appendChild(colItem);
        row.appendChild(colPrice);

        tableBody.appendChild(row);
    });
}

function bindEvents(): void {
    // const input_number_divs = document.querySelectorAll(".input-number-div");
    // input_number_divs.forEach(divElm => {
    //     [divElm.firstElementChild, divElm.lastElementChild].forEach(elm => {
    //         elm?.addEventListener("click", updateItems);
    //     });
    // });
    const totalHoursElm = document.getElementById("total-hours") as HTMLInputElement;
    const hoursPerDayElm = document.getElementById("hours-per-day") as HTMLInputElement;
    const weeksElm = document.getElementById("weeks") as HTMLInputElement;
    [totalHoursElm, hoursPerDayElm, weeksElm].forEach(elm => {
        elm?.addEventListener("change", updateTotalPriceDisplay);
    });
}

export default function onLoad() {
    selectedItems.clear();
    populateTable();
    initInputNumber(".input-number", updateItems);
    bindEvents();
}
