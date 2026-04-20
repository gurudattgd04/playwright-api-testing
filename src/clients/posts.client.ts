import { BaseApiClient, TimedResponse } from "@clients/base.client";

export interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export type CreatePostPayload = Omit<Post, 'id'>;
export type UpdatePostPayload = Partial<Post>;

export class PostClient extends BaseApiClient {
    private readonly basePath = "/posts";

    getAll(): Promise<TimedResponse<Post[]>> {
       return this.get<Post[]>(this.basePath)
    }

    getById(id: number): Promise<TimedResponse<Post>> {
        return this.get<Post>(`${this.basePath}/${id}`)
    }

    getByUserId(userId: number): Promise<TimedResponse<Post[]>> {
        return this.get<Post[]>(`${this.basePath}/${userId}`)
    }

    create(payload: CreatePostPayload): Promise<TimedResponse<Post>> {
        return this.post<Post>(this.basePath, {data: payload})
    }

    updateById(id: number, payload: UpdatePostPayload): Promise<TimedResponse<Post>> {
        return this.put<Post>(`${this.basePath}/${id}`, {data: payload})
    }

}