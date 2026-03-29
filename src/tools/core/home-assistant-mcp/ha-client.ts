import axios, { AxiosInstance } from 'axios';

export interface HAState {
    entity_id: string;
    state: string;
    attributes: Record<string, any>;
    last_changed: string;
    last_updated: string;
}

export interface HAServiceCall {
    domain: string;
    service: string;
    entity_id?: string;
    service_data?: Record<string, any>;
}

export class HAClient {
    private client: AxiosInstance;

    constructor(baseUrl: string, token: string) {
        // Ensure base URL doesn't end with a trailing slash to prevent double slashes in routes
        const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        
        this.client = axios.create({
            baseURL: normalizedBaseUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            // Configure a reasonable timeout for smart home actions
            timeout: 10000, 
        });
    }

    /**
     * Standardized error handler to extract meaningful messages from HA or Axios.
     */
    private handleError(error: any, context: string): never {
        let errorMessage = `HA API Error (${context}): `;
        
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a status code outside 2xx
                const status = error.response.status;
                if (status === 401 || status === 403) {
                    errorMessage += `Authentication Failed (${status}). Check your HA_TOKEN.`;
                } else if (status === 404) {
                    errorMessage += `Endpoint or Entity Not Found (404).`;
                } else {
                    const data = error.response.data;
                    errorMessage += `Status ${status}. Details: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
                }
            } else if (error.request) {
                // The request was made but no response was received (e.g., connection refused, timeout)
                errorMessage += `No response received. Check your HA_URL and ensure Home Assistant is reachable. (${error.message})`;
            } else {
                // Something happened in setting up the request
                errorMessage += `Request setup failed: ${error.message}`;
            }
        } else {
            errorMessage += error instanceof Error ? error.message : String(error);
        }

        throw new Error(errorMessage);
    }

    /**
     * Retrieves the current state of all entities.
     * @returns Array of HAState objects.
     */
    async getStates(): Promise<HAState[]> {
        try {
            const response = await this.client.get('/api/states');
            return response.data as HAState[];
        } catch (error) {
            this.handleError(error, 'getStates');
        }
    }

    /**
     * Retrieves the state of a specific entity.
     * @param entityId The ID of the entity (e.g., 'light.living_room').
     * @returns The state object or null if not found.
     */
    async getState(entityId: string): Promise<HAState | null> {
        try {
            const response = await this.client.get(`/api/states/${entityId}`);
            return response.data as HAState;
        } catch (error) {
            // HA returns 404 for unknown entities. Let's return null instead of throwing an error for easier checking.
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            this.handleError(error, `getState(${entityId})`);
        }
    }

    /**
     * Calls a Home Assistant service.
     * @param call The service call details (domain, service, target, data).
     * @returns Array of HAState objects affected by the call.
     */
    async callService(call: HAServiceCall): Promise<HAState[]> {
        try {
            const payload: Record<string, any> = { ...call.service_data };
            if (call.entity_id) {
                payload.entity_id = call.entity_id;
            }

            const response = await this.client.post(`/api/services/${call.domain}/${call.service}`, payload);
            return response.data as HAState[];
        } catch (error) {
            this.handleError(error, `callService(${call.domain}.${call.service})`);
        }
    }

    /**
     * Retrieves the service registry.
     */
    async getServices(): Promise<any> {
        try {
            const response = await this.client.get('/api/services');
            return response.data;
        } catch (error) {
            this.handleError(error, 'getServices');
        }
    }

    /**
     * Lists all automations by filtering the state machine.
     * This provides the internal 'id' needed for config operations.
     */
    async getAutomations(): Promise<any[]> {
        try {
            const states = await this.getStates();
            return states
                .filter(s => s.entity_id.startsWith('automation.'))
                .map(s => ({
                    entity_id: s.entity_id,
                    state: s.state,
                    friendly_name: s.attributes.friendly_name,
                    id: s.attributes.id // This is the crucial ID for config endpoints
                }));
        } catch (error) {
            this.handleError(error, 'getAutomations');
        }
    }

    /**
     * Retrieves the config for a specific automation.
     */
    async getAutomationConfig(automationId: string): Promise<any> {
        try {
            const response = await this.client.get(`/api/config/automation/config/${automationId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, `getAutomationConfig(${automationId})`);
        }
    }

    /**
     * Saves (creates or updates) an automation config.
     */
    async saveAutomation(automationId: string, config: any): Promise<any> {
        try {
            const response = await this.client.post(`/api/config/automation/config/${automationId}`, config);
            return response.data;
        } catch (error) {
            this.handleError(error, `saveAutomation(${automationId})`);
        }
    }

    /**
     * Deletes an automation config.
     */
    async deleteAutomation(automationId: string): Promise<any> {
        try {
            const response = await this.client.delete(`/api/config/automation/config/${automationId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, `deleteAutomation(${automationId})`);
        }
    }

    /**
     * Lists all config entries (integrations).
     */
    async getConfigEntries(): Promise<any[]> {
        try {
            const response = await this.client.get('/api/config/config_entries/entry');
            return response.data;
        } catch (error) {
            this.handleError(error, 'getConfigEntries');
        }
    }

    /**
     * Reloads a specific config entry.
     */
    async reloadConfigEntry(entryId: string): Promise<any> {
        try {
            const response = await this.client.post(`/api/config/config_entries/entry/${entryId}/reload`);
            return response.data;
        } catch (error) {
            this.handleError(error, `reloadConfigEntry(${entryId})`);
        }
    }
}
