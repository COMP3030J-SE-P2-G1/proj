export function ready(fn: () => void) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

/*
 * Load a CSS file.
 * @param {string} url : The url of the resourse to load.
 * @param {function} onReady : Call back when the resource has been loaded.
 */
export function loadCss(url: string, onReady: () => void)
{
    const links = document.querySelectorAll("link[href='" + url + "']");
    if (links.length === 0) {
        var head = document.getElementsByTagName( "head" )[0];
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", url);
        if (onReady instanceof Function) {
            fileref.onload  = onReady;
        }
        head.insertBefore( fileref, head.firstChild );
    }
    else {
        if (onReady instanceof Function) onReady();
    }
}

/*
 * Loads a list of css files.
 * @param {array|string} urls : This can pass a single url, or an array of urls.
 * @param {function} onReady : This is the callback after each css file has been loaded.
 */
export function loadCssList(urls: string[], onReady: () => void) {
    let awaiting = urls.length;
    function doneAwaiting() {
        awaiting--;
        if (awaiting === 0) {
            if (onReady instanceof Function)
                onReady();
        }
    }
    for (let i = 0; i < urls.length; i++) {
        loadCss(urls[i], doneAwaiting);
    }
}

/**
 * Wait for (block until) a condition come true;
 */
export function waitFor(condition: () => boolean, step = 250, timeout = Infinity) {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        let running = false;
        const interval = setInterval(() => {
            if (running) return;
            running = true;
            const result = condition();
            if (result) {
                clearInterval(interval);
                resolve(result);
            } else if (Date.now() - now >= timeout * 1000) {
                clearInterval(interval);
                reject(result);
            }
            running = false;
        }, step);
    });
}


/**
 * add dates to a Date object
 */
export function dateAdd(date: Date, d: number) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + d);
    return newDate;
}
