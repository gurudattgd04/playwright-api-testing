import {test, expect} from "@playwright/test"

type Post = {
    id: number,
    userId: number,
    title: string,
    body: string
}

test.describe("All test validation related to posts", () => {

test("GET /posts/1 returns expected post", async({request}) => {

    const res = await request.get("/posts/1")

    expect(res.status()).toBe(200)
    expect(res.ok()).toBeTruthy()

    const post = await res.json()

    expect(post).toEqual({
        id: 1,
        userId: 1,
        title: expect.any(String),
        body: expect.any(String)
    })

    expect(res.headers()["content-type"]).toContain("application/json")
})

test("GET /posts?userId=8 returns 10 posts for user 8", async ({request}) => {
    
    const res = await request.get("/posts?userId=8")

    const respBody = await res.json()
    expect(res.status()).toBe(200)
    expect(res.ok()).toBeTruthy()

    expect(respBody).toHaveLength(10)
    expect(respBody.every((data:Post) => data.userId ===8)).toBe(true)
})

})

test("POST /posts creates a post", async({request}) => {
    const res = await request.post("/posts", {
       data: {
         id: 123,
        userId: 121213,
        title: "Guru post",
        body: "Test body"
       }
    })

    const resBody = await res.json()
    
    expect(res.status()).toBe(201)
    expect(resBody.title).toEqual("Guru post")
})

