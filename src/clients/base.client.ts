import { APIRequestContext, APIResponse } from "@playwright/test";

export interface TimedResponse<T = unknown> {
    status: number;
    headers: Record<string, string>;
    body: T;
    rawBody: string;
    timeMs: number;
    raw: APIResponse;
}

export interface RequestOptions {
    header?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    data?: unknown;
    form?: Record<string, string>;
    multipart?: Record<string, unknown>;
    timeout?: number;
}

export class BaseApiClient {
    constructor(protected ctx: APIRequestContext, 
        protected logger: (msg: string, meta?: unknown) => void = () => {}) {}

    async get<T = unknown>(path: string, opts: RequestOptions = {}) {
        return this.execute<T>('GET', path, opts);
    }

    async post<T = unknown>(path: string, opts: RequestOptions = {}){
        return this.execute<T>('POST', path, opts);
    }

    async put<T = unknown>(path: string, opts: RequestOptions = {}) {
        return this.execute<T>('PUT', path, opts);
    }

    async patch<T = unknown>(path: string, opts: RequestOptions = {}){
        return this.execute<T>('PATCH', path, opts);
    }

    async delete<T = unknown>(path: string, opts: RequestOptions = {}){
        return this.execute<T>('DELETE', path, opts)
    }

    private async execute<T>(
        method: string,
        path: string,
        opts: RequestOptions
    ): Promise<TimedResponse<T>> {
        const start = performance.now()

        this.logger(`-> ${method} ${path}`, {params: opts.params, body: opts.data});

        const response = await this.ctx.fetch(path, {
            method,
            headers: opts.header,
            params: opts.params,
            data: opts.data,
            form: opts.form,
            multipart: opts.multipart as never,
            timeout: opts.timeout
        });

        const timeMs = Math.round(performance.now() -start);
        const rawBody = await response.text();

        let body: T;
        try{
            body = rawBody ? (JSON.parse(rawBody) as T) : (null as T)
        }
        catch{
            body = rawBody as unknown as T;
        }

        this.logger(`<- ${response.status()} ${method} ${path} (${timeMs}ms)`);

        return {
            status: response.status(),
            headers: response.headers(),
            body,
            rawBody,
            timeMs,
            raw: response
        }
    }
}