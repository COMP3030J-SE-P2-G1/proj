type NullableNumber = number | null;

/**
 * @param selector: a selector for selectoring 
 */
export function initInputNumber(selector: string) {
    const elements: NodeListOf<HTMLInputElement> = document.querySelectorAll(selector);

    elements.forEach((element) => {
        const min: NullableNumber = element.hasAttribute('min') ? parseInt(element.getAttribute('min')!) : null;
        const max: NullableNumber = element.hasAttribute('max') ? parseInt(element.getAttribute('max')!) : null;

        const decButton: HTMLElement | null = element.previousElementSibling as HTMLElement;
        const incButton: HTMLElement | null = element.nextElementSibling as HTMLElement;

        if (decButton) {
            decButton.addEventListener('click', () => decrement(element, min));
        }

        if (incButton) {
            incButton.addEventListener('click', () => increment(element, max));
        }
    });

    function decrement(el: HTMLInputElement, min: NullableNumber) {
        let value: number = parseInt(el.value) || 0;
        value--;
        if (min === null || value >= min) {
            el.value = value.toString();
        }
    }

    function increment(el: HTMLInputElement, max: NullableNumber) {
        let value: number = parseInt(el.value) || 0;
        value++;
        if (max === null || value <= max) {
            el.value = value.toString();
        }
    }
}
