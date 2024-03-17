/**
 * This lib contains useful animation functions
 */

/**
 * Add shadow to sticky header when it is not at its original place (top)
 * By default add 'shadow-sm' class
 */
export function stickyHeaderAddShadowHandler(elem: HTMLElement) {
    const scrollHandler = () => {
        const top = window.scrollY > 10 ? false : true;
        if (top) {
            // note: `shadow` class needs to be in tailwind's safelist
            elem.classList.remove('shadow');
        } else {
            elem.classList.add('shadow');
        }
    }
    window.addEventListener('scroll', scrollHandler);
}
