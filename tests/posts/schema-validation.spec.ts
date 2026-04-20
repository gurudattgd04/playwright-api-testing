import {test, expect} from "@playwright/test"
import { parseArraySchema, parseSchema, PostSchema, safeParseSchema } from "@validators/zod-schema"

test.describe("M3: Schema validation for Post", async () => {
    test("GET /posts/1 validates with zod Postschema", async({request}) => {

        const response = await request.get("/posts/1")
        const raw = await response.json()

        const post = parseSchema(PostSchema, raw)
        expect(post.userId).toBe(1)
        expect(post.title.length).toBeGreaterThan(0)
    })

    test("GET /posts validates array with zod", async({request})=> {
        const response = await request.get("/posts")
        const raw = await response.json()

        const posts = parseArraySchema(PostSchema, raw)

        expect(posts).toHaveLength(100)
        expect(posts[0].id).toBe(1)
        expect(posts[99].id).toBe(100)
    })

    test("Zod rejects posts with invalid types", () => {
        const badPost = {userId: "not-number", id:1, title: "ok", body: "ok"}
        const result = safeParseSchema(PostSchema, badPost)

        expect(result.success).toBe(false)
        if(!result.success)
        {
            expect(result.error.issues[0].path).toContain("userId")
        }
    })
})