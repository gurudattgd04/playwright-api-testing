import {test, expect} from "@fixtures/api.fixture"

test.describe("M2 - Posts via framework", () => {
    test("GET /posts/1 return expected post", async ({postsClient}) => {
        const res = await postsClient.getById(1)

        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({
            id:1,
            userId:1,
            title: expect.any(String),
            body: expect.any(String)
        })
        expect(res.timeMs).toBeLessThan(5000)
    })
})