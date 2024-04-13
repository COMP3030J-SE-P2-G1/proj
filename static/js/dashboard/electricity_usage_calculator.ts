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


function createInputNumberHTML(): string {
    return `
    <div>
    <span class="input-number-decrement">–</span>
    <input class="input-number" type="text" value="0" min="0" max="10">
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
        colItem.textContent = item.name;
        const colPrice = document.createElement('td');
        if (typeof item.consumption == "number") {
            colPrice.textContent = `${item.consumption} kWh`;
        } else {
            colPrice.textContent = "hi";
        }
        
        row.appendChild(colNumber);
        row.appendChild(colItem);
        row.appendChild(colPrice);

        tableBody.appendChild(row);
    });
}

export default function onLoad() {
    populateTable();
    initInputNumber(".input-number");
}
