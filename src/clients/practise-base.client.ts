// The base class will have interface, TimedResponse and RequestOptions
// This class has contstructor which accepts APIRequestContext 
// The get, post, put, patch, delete method
// those methods will call private execute method - which will use fetch and return TimedResponse

import { APIRequestContext, APIResponse } from "@playwright/test";


export interface TimedResponse<T= unknown> {
    status: number,
    header: Record<string, string>,
    body: T,
    rawBody: string,
    raw: APIResponse,
    timeMs: number
}

export interface RequestOptions {
    headers?: Record<string, string>,
    data?: unknown,
    params?: Record<string, string | number | boolean>,
    form?: Record<string, string>,
    multipart?: Record<string, unknown>,
    timeout?: number
}

export class BaseAPIClient {

    constructor(protected ctx: APIRequestContext){}

    async get<T = unknown>(path: string, opts: RequestOptions = {}): Promise<TimedResponse<T>>{
        return this.execute<T>('GET', path, opts)
    }

    private async execute<T>(
        method: string,
        path: string,
        opts: RequestOptions
    ): Promise<TimedResponse<T>>{

        //start timer
        const start = performance.now()

        const response = await this.ctx.fetch(path, {
            headers: opts.headers,
            data: opts.data,
            form: opts.form,
            params: opts.params,
            method,
            multipart: opts.multipart as never,
            timeout: opts.timeout
        })

        const timeMs = Math.round(performance.now()-start)

        const rawBody = await response.text()

        let body: T;
        try
        {
            body = rawBody ? (JSON.parse(rawBody) as T) : (null as T)
        }
        catch
        {
            body = rawBody as unknown as T
        }

        return {
            status: response.status(),
            header: response.headers(),
            body,
            rawBody,
            timeMs,
            raw: response
        }
    }
}