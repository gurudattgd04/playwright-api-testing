import {test, expect} from "../../src/fixtures/api.fixture"

import {
    jsonPath,
    jsonPathFirst,
    jsonPathCount,
    jsonPathExists
} from "../../src/validators/jsonpath.helper"

test.describe("m4: custom matchers", () => {
    test("response time assertion", async ({postsClient}) => {
        const res = await postsClient.getById(1)
        expect(res).toHaveStatus(200)
        expect(res).toRespondWithin(4000)
    })


    test("header assertion", async({postsClient}) => {
        const res = await postsClient.getById(1)
        expect(res).toHaveHeaderContaining('content-type', 'json')
    })

    test("JSONPath value assertion", async({postsClient}) => {
        const res = await postsClient.getById(1)

        expect(res).toHaveJsonPath("$.id", 1)
    })
})
