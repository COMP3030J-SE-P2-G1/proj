import type { AcceptLangs } from './types.ts';

export async function setLangugage(lang: AcceptLangs): Promise<any> {
    const response = await fetch(`/misc/set-language=${lang}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function getSessionLangugage(): Promise<any> {
    const response = await fetch(`/misc/get-language`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
