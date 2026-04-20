import {test as base, APIRequestContext} from "@playwright/test"
import { PostClient } from "@clients/posts.client"
import { jsonPlaceholderSpec } from "@specs/request.spec"

type APIFixtures = {
    jsonPlaceholderCtx: APIRequestContext,
    postsClient: PostClient
}

export const test = base.extend<APIFixtures>({

    jsonPlaceholderCtx: async({}, use) => {
        const ctx = await jsonPlaceholderSpec().build();
        await use(ctx)
        await ctx.dispose()
    },

    postsClient: async({jsonPlaceholderCtx}, use) => {
        const client = new PostClient(jsonPlaceholderCtx, (msg) => console.log(msg))
        await use(client)
    }
})

export {expect} from "../utils/custom-matchers"