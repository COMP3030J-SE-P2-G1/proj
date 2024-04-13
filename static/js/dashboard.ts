/**
 * Dashboard
 */

import { ready } from "./lib/utils";
import htmx from 'htmx.org';
window.htmx = htmx;

const DASHBOARD_URL_PREFIX = "/dashboard/";

// the reason to use a module importer is because parcel will replace the module name in build time
// and we cannot pass dynamic name to `import` function, otherwise it won't work.
type ModuleImporter = () => Promise<any>;
/**
 * Dynamically load a module
 * @param moduleName: the moduleName, just a label used in console error message
 * @param importer: functions like `() => { import("./dashboard/electricity_usage_calculator.ts"); }`
 *   The loaded module should have a default export function takes no argument
 */
async function loadModule(moduleName: string, importer: ModuleImporter) {
    await importer().then(function (module) {
        if (typeof module.default === 'function') {
            module.default();
        } else {
            console.error(`Module ${moduleName}'s default export is not a function!`);
        }
    }).catch((error) => {
        console.error(`Failed to load module for ${moduleName}:`, error);
    });
}


function htmxAfterSettleHandler(event: CustomEvent<any>) {
    let requestPath: string = event.detail.pathInfo.requestPath;
    if (!requestPath.startsWith(DASHBOARD_URL_PREFIX)) return;
    requestPath = requestPath.substring(DASHBOARD_URL_PREFIX.length);
    switch (requestPath) {
        case 'electricity_usage_calculator':
            void loadModule("electricity_usage_calculator.ts", () => import("./dashboard/electricity_usage_calculator.ts"));
            break;
        default:
            break;
    }
}



(function (){
    ready(() => {
        document.body.addEventListener<any>('htmx:afterSettle', htmxAfterSettleHandler);
    });
})();
