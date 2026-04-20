import { APIRequestContext, request } from "@playwright/test";

export interface RequestSpecConfig {
    baseURL: string;
    headers?: Record<string, string>;
    timeout?: number;
    ignoreHTPPSErrors?: boolean
}

export class RequestSpec {
    private config: RequestSpecConfig;

    constructor(config: RequestSpecConfig) {
        this.config = {
            timeout: 30_000,
            ...config,
            headers: {
                Accept: 'application/json',
                'Content-Type' : 'application/json',
                ...(config?.headers || {}),
            }
        }
    }

    withHeader(key: string, value: string): this {
        this.config.headers = {...this.config.headers, [key]: value}
        return this;
    }

    withBearerToken(token: string): this {
        return this.withHeader('Authorization', `Bearer ${token}`)
    }

    withBasicAuth(username: string, password: string): this {
        const encoded = Buffer.from(`${username}:${password}`).toString('base64')
        return this.withHeader('Authorization', `Basic ${encoded}`)
    }

    withApiKey(key: string, headerName = 'x-API-key'): this {
        return this.withHeader(headerName, key)
    }

    async build(): Promise<APIRequestContext> {
        return request.newContext({
            baseURL: this.config.baseURL,
            extraHTTPHeaders: this.config.headers,
            timeout: this.config.timeout,
            ignoreHTTPSErrors: this.config.ignoreHTPPSErrors
        })
    }
}

export const jsonPlaceholderSpec = () => new RequestSpec({baseURL: "https://jsonplaceholder.typicode.com"})

export const restfulBookerSpec = () => new RequestSpec({baseURL: "https://restful-booker.herokuapp.com"})

export const dummyJsonSpec = () => new RequestSpec({baseURL: "https://dummyjson.com"})


