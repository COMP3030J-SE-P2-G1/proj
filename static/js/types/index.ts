import htmx from 'htmx.org';

declare global {
    interface Window {
        htmx: typeof htmx,
    }
}
