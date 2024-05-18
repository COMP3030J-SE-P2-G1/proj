import { API_PREFIX } from './constants.ts';
import type { ApiKey } from './types.ts';

export async function getApiKeyList(): Promise<ApiKey[]> {
    const response = await fetch(`${API_PREFIX}/apikey/list`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

export async function createApiKey(desc: string | null): Promise<ApiKey> {
    const response = await fetch(`${API_PREFIX}/apikey/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            desc: desc
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

export async function deleteApiKey(id: number): Promise<ApiKey> {
    const response = await fetch(`${API_PREFIX}/apikey/${id}/delete`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

export async function setApiKeyEnabledStatus(id: number, enabled: boolean): Promise<ApiKey> {
    const endpoint = enabled ? `${API_PREFIX}/apikey/${id}/enable` : `${API_PREFIX}/apikey/${id}/disable`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

