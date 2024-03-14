/**
 * This file servers as an example for importing typescript functions to a javascript file
 */
import { ready } from './lib/utils.ts';

(function () {
    ready(() => {
        console.log("El Psy Kongaroo");
    });
})();
