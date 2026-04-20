import {request, test } from "@playwright/test"

type Post = {
  userId: number
  id : number
  title: string
  body: string

}

test("Get posts", async({request}) => {

  const res =  await request.get("https://jsonplaceholder.typicode.com/posts")
  const resBody = await res.json()
  //console.log(await resBody)
  const getTitleForUser = resBody.filter((data: Post) => data.userId === 8 && data.id === 80).map((data: Post) => data.title )
  console.log(getTitleForUser)
})