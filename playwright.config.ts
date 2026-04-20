import { defineConfig } from "@playwright/test";

export default defineConfig ({
  testDir: "./tests",
  timeout: 30_000,
  expect: {timeout: 30_000},


  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2: 0,
  workers: process.env.CI ? 2: 1,

  reporter: [
     ['list'],
     ['html', {open: "never"}],
     ["json", {outputFile: "test-results/results.json"}]
  ],

   use: {
    extraHTTPHeaders: {
      Accept: 'application/json',
      'User-Agent': 'pw-api-framework/1.0',
    },
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: "jsonplaceholder",
      testMatch: "tests/posts/**/*.spec.ts",
      use: {baseURL: "https://jsonplaceholder.typicode.com"},

    },
    {
      name: "restful-booker",
      testMatch: "tests/booking/**/*.spec.ts",
      use: {baseURL: "https://restful-booker.herokuapp.com"}
    },
    {
      name: "dummyjson",
      testMatch: "tests/product/**/*.spec.ts",
      use: {baseURL: "https://dummyjson.com"}
    }
  ]


})
