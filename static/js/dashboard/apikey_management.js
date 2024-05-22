import * as APIKEY from '../api/apikey.ts';

let rowCounter = 0;

function closeDialog(dialogElm) {
    if (dialogElm !== null && dialogElm.open) {
        dialogElm.close();
    }
}

function initializeApiKeysList() {
    const keyTableBodyElm = document.querySelector('#keyTableBody');

    showLoadingOverlay();
    APIKEY.getApiKeyList().then(apikeys => {
        const rowElms = [];
        for (const [index, apikey] of apikeys.entries()) {
            rowElms.push(genNewRow(apikey, index + 1));
        }
        keyTableBodyElm.replaceChildren(...rowElms);
        tbody.removeChild(overlay); // though `replaceChildren` already removes the loading indicator...
    });
}

function genNewRow(apikey, index = 1) {
    const newRow = document.createElement('tr');

    const indexCell = document.createElement('td');
    indexCell.textContent = `${index}`;
    newRow.appendChild(indexCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = apikey.desc;
    newRow.appendChild(nameCell);

    const secretKeyCell = document.createElement('td');
    secretKeyCell.textContent = apikey.token;
    newRow.appendChild(secretKeyCell);

    const createdCell = document.createElement('td');
    createdCell.textContent = new Date(apikey.created_time).toLocaleDateString();
    newRow.appendChild(createdCell);

    const lastUsedCell = document.createElement('td');
    lastUsedCell.textContent = apikey.last_used_time ? new Date(apikey.last_used_time).toLocaleDateString() : "Never";
    newRow.appendChild(lastUsedCell);

    const enabledElm = document.createElement('td');
    const toggleElm = document.createElement("input");
    toggleElm.setAttribute("type", "checkbox");
    toggleElm.setAttribute("class", "toggle toggle-success");
    toggleElm.checked = apikey.enabled;
    toggleElm.addEventListener("change", _event => {
        APIKEY.setApiKeyEnabledStatus(apikey.id, !apikey.enabled).then(_ => {
            initializeApiKeysList();
        });
    });
    enabledElm.appendChild(toggleElm);
    newRow.appendChild(enabledElm);

    const deleteButtonCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 12 12">
            <path fill="currentColor" d="M5 3h2a1 1 0 0 0-2 0M4 3a2 2 0 1 1 4 0h2.5a.5.5 0 0 1 0
                1h-.441l-.443 5.17A2 2 0 0 1 7.623 11H4.377a2 2 0 0 1-1.993-1.83L1.941 4H1.5a.5.5 0 0 1
                0-1zm3.5 3a.5.5 0 0 0-1 0v2a.5.5 0 0 0 1 0zM5 5.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V6a.5.5
                0 0 1 .5-.5M3.38 9.085a1 1 0 0 0 .997.915h3.246a1 1 0 0 0 .996-.915L9.055 4h-6.11z"/>
        </svg>`;

    deleteButton.addEventListener('click', function() {
        APIKEY.deleteApiKey(apikey.id).then(_ => {
            initializeApiKeysList();
        });
    });

    deleteButtonCell.appendChild(deleteButton);
    newRow.appendChild(deleteButtonCell);
    
    return newRow;
}

function bindEvent() {
    const createKeyButton = document.querySelector('#createKeyButton');
    const keyDescElm = document.querySelector('#keyDesc');
    const copyButton = document.querySelector('#copyButton');

    createKeyButton.addEventListener('click', function(event) {
        const dialogElm = document.getElementById("dialog_create_apikey");
        const keyDesc = keyDescElm.value.trim();

        APIKEY.createApiKey(keyDesc).then(newApiKey => {
            initializeApiKeysList();
            closeDialog(dialogElm);
            showCreatedApiKey(newApiKey);
        });
    });

    // Add click event listeners to copyButton
    copyButton.addEventListener('click', _event => {
        copySecretKey().then(result => {
            if (!result) return;
            const showApikeyDialogElm = document.getElementById("dialog_show_apikey");
            closeDialog(showApikeyDialogElm);
        });
    });
}

function showCreatedApiKey(apikey) {
    const secretKeyDisplayElm = document.querySelector('#secretKeyDisplay');
    secretKeyDisplayElm.textContent = apikey.token;

    const dialog_show_apikey = document.querySelector('#dialog_show_apikey');
    dialog_show_apikey.showModal();
}

async function copySecretKey() {
    const secretKey = document.getElementById("secretKeyDisplay").innerText;

    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(secretKey).then(() => {
            alert("Secret key is copied to clipboard");
        });
        return true;
    } else {
        alert("Clipboard is not available due to insecure environments(like http) or something else. Please manually select and opy the text.");
        return false;
    }
}

function showLoadingOverlay() {
    const tbody = document.getElementById('keyTableBody');
    
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-black bg-opacity-20 flex justify-center items-center';
    
    const loadingIndicator = document.createElement('span');
    loadingIndicator.className = 'loading loading-ring loading-lg';
    
    overlay.appendChild(loadingIndicator);
    
    tbody.appendChild(overlay);
}

function hideLoadingOverlay() {
    const tbody = document.getElementById('keyTableBody');
    
    const overlay = tbody.querySelector('.absolute.inset-0.bg-black.bg-opacity-50');
    if (overlay) {
        tbody.removeChild(overlay);
    }
}

export default function onLoad() {
    initializeApiKeysList();
    bindEvent();
}
