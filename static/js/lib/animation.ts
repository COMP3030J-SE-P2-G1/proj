/**
 * This lib contains useful animation functions
 */

/**
 * Add shadow to sticky header when it is not at its original place (top)
 * By default add 'shadow-sm' class
 */
export function stickyHeaderAddShadowHanlder(elem: HTMLElement) {
    const scrollHandler = () => {
        const top = window.scrollY > 10 ? false : true;
        if (top) {
            // TODO I don't know why only shadow-sm works (shadow-lg, ... doesn't work)
            elem.classList.remove('shadow-sm');
        } else {
            elem.classList.add('shadow-sm');
        }
    }
    window.addEventListener('scroll', scrollHandler);
}
