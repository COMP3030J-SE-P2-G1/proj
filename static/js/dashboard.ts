/**
 * Dashboard
 */

import { ready, loadCss, loadCssList } from "./lib/utils";
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

/**
 * handle htmx:confirm event, can do things like loading css files(you can use
 * utility functions like `loadCss` and `loadCssList`)
 * One disadvantage of it is that we cannot load css and do request for our sub-page
 * in parallel. (It's also not possible to introduce a mutex and block/delay the subsequence
 * htmx request since htmx's event hanlding is async)
 */
function htmxConfirmHanlder(event: CustomEvent<any>) {
    function lc(url: string) {
        loadCss(url, () => { event.detail.issueRequest();});
    }
    event.preventDefault();
    let requestPath: string = event.detail.path;
    if (!requestPath.startsWith(DASHBOARD_URL_PREFIX)) return;
    requestPath = requestPath.substring(DASHBOARD_URL_PREFIX.length);
    switch (requestPath) {
        case 'api_doc/restful':
            lc("https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css");
            break;
        case 'api_doc/graphql_playground':
            lc("https://unpkg.com/graphiql/graphiql.min.css");
            break;
        default:
            event.detail.issueRequest();
            break;
    }
}

/**
 * hanlde htmx:afterSettle event, can do things like load and execute an ES module
 */
function htmxAfterSettleHandler(event: CustomEvent<any>) {
    let requestPath: string = event.detail.pathInfo.requestPath;
    if (!requestPath.startsWith(DASHBOARD_URL_PREFIX)) return;
    requestPath = requestPath.substring(DASHBOARD_URL_PREFIX.length);
    switch (requestPath) {
        case 'tool/electricity_usage_calculator':
            void loadModule("electricity_usage_calculator.ts", () => import("./dashboard/electricity_usage_calculator.ts"));
            break;
        case 'api_doc/restful':
            void loadModule("api_doc_restful.ts", () => import("./dashboard/api_doc_restful.ts"));
            break;
        case 'usage':
            void loadModule("usage_update.ts", () => import("./dashboard/usage_update.ts"));
            break;
        case 'profile':
            void loadModule("create_profile.ts", () => import("./dashboard/create_profile.ts"));
            break;
        case 'api_doc/graphql_playground':
            void loadModule("api_doc_graphql_playground.ts", () => import("./dashboard/api_doc_graphql_playground.ts"));
            break;
        default:
            break;
    }
}

/**
 * Use this function to async load resources
 */
function asyncLoad() {
    // Promise may not be necessary here
    return new Promise<void>(() => {
        loadCssList(
            [
                "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css",
                "https://unpkg.com/graphiql/graphiql.min.css"
            ],
            () => {}
        );
        import("./lib/chart.ts");
        import("./dashboard/electricity_usage_calculator.ts");
        import("./dashboard/api_doc_restful.ts");
        import("./dashboard/usage_update.ts");
        import("./dashboard/create_profile.ts")
        import("./dashboard/api_doc_graphql_playground.ts");
    });
}


(function (){
    ready(() => {
        document.body.addEventListener<any>('htmx:confirm', htmxConfirmHanlder);
        document.body.addEventListener<any>('htmx:afterSettle', htmxAfterSettleHandler);
        asyncLoad();
    });
})();
