# Playwright API Test Framework

A TypeScript-based API testing framework built on [Playwright](https://playwright.dev/), designed for testing REST APIs with typed clients, schema validation, JSONPath assertions, and custom matchers.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Architecture](#architecture)
  - [Request Spec Builder](#1-request-spec-builder)
  - [Base API Client](#2-base-api-client)
  - [Resource Clients](#3-resource-clients)
  - [Fixtures](#4-fixtures)
  - [Validators](#5-validators)
  - [Custom Matchers](#6-custom-matchers)
- [Writing Tests](#writing-tests)
  - [Raw Request Tests](#raw-request-tests)
  - [Client-Layer Tests](#client-layer-tests)
  - [Schema Validation Tests](#schema-validation-tests)
  - [JSONPath Assertions](#jsonpath-assertions)
- [Custom Matchers Reference](#custom-matchers-reference)
- [Configuration](#configuration)

---

## Overview

This framework provides a structured, layered approach to API testing:

- **Typed HTTP clients** with response time tracking
- **Zod schema validation** for runtime type safety
- **JSONPath helpers** for flexible body assertions (inspired by Rest Assured's GPath)
- **Custom Playwright matchers** for expressive, readable assertions
- **Multi-environment support** via Playwright named projects

---

## Tech Stack

| Tool | Purpose |
| --- | --- |
| [Playwright](https://playwright.dev/) | Test runner and HTTP client |
| [TypeScript](https://www.typescriptlang.org/) | Type safety across all layers |
| [Zod](https://zod.dev/) | Runtime schema validation |
| [jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath) | JSONPath body assertions |
| [AJV](https://ajv.js.org/) | JSON Schema (AJV) validation support |

---

## Project Structure

```
├── playwright.config.ts          # Projects, reporters, global settings
├── tsconfig.json                 # Path aliases and compiler options
├── src/
│   ├── clients/
│   │   ├── base.client.ts        # BaseApiClient — generic HTTP methods + TimedResponse
│   │   └── posts.client.ts       # PostClient — resource-specific methods
│   ├── fixtures/
│   │   └── api.fixture.ts        # Playwright test.extend — wires clients into tests
│   ├── schemas/
│   │   └── post.schema.json      # JSON Schema definitions
│   ├── specs/
│   │   └── request.spec.ts       # RequestSpec builder — constructs APIRequestContext
│   ├── utils/
│   │   └── custom-matchers.ts    # Extended expect with API-specific matchers
│   └── validators/
│       ├── jsonpath.helper.ts    # JSONPath query helpers
│       └── zod-schema.ts         # Zod schemas and parse helpers
└── tests/
    ├── example.spec.ts           # Scratch / exploration tests
    └── posts/
        ├── m1-smoke.spec.ts      # Raw Playwright request API tests
        ├── m2-smoke.spec.ts      # Framework client-layer tests
        ├── m4-smoke.spec.ts      # Custom matcher tests
        └── schema-validation.spec.ts  # Zod schema validation tests
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Type Check

```bash
npm run typecheck
```

---

## Running Tests

```bash
# Run all tests across all projects
npm test

# Run posts tests (jsonplaceholder API)
npm run test:posts

# Run booking tests (restful-booker API)
npm run test:booking

# Run product tests (dummyjson API)
npm run test:product

# Run auth tests
npm run test:auth

# Run a single test file
npx playwright test tests/posts/m2-smoke.spec.ts --project=jsonplaceholder

# Run tests matching a name pattern
npx playwright test --grep "GET /posts/1" --project=jsonplaceholder

# Debug mode (opens Playwright Inspector)
npm run test:debug

# Open the HTML report after a run
npm run test:report
```

---

## Architecture

### 1. Request Spec Builder

**`src/specs/request.spec.ts`**

Fluent builder that constructs a Playwright `APIRequestContext` with a configured base URL, headers, and auth. Used to bootstrap clients or fixtures.

```typescript
const ctx = await new RequestSpec({ baseURL: 'https://api.example.com' })
  .withBearerToken('my-token')
  .build();
```

Pre-built factories for the three test environments:

```typescript
jsonPlaceholderSpec()   // https://jsonplaceholder.typicode.com
restfulBookerSpec()     // https://restful-booker.herokuapp.com
dummyJsonSpec()         // https://dummyjson.com
```

Auth helpers available on `RequestSpec`:

| Method | Description |
| --- | --- |
| `.withBearerToken(token)` | Sets `Authorization: Bearer <token>` |
| `.withBasicAuth(user, pass)` | Sets `Authorization: Basic <base64>` |
| `.withApiKey(key, header?)` | Sets a custom API key header (default: `x-API-key`) |
| `.withHeader(key, value)` | Sets any arbitrary header |

---

### 2. Base API Client

**`src/clients/base.client.ts`**

`BaseApiClient` wraps `APIRequestContext` and provides typed HTTP methods. Every call returns a `TimedResponse<T>`:

```typescript
interface TimedResponse<T = unknown> {
  status:  number;
  headers: Record<string, string>;
  body:    T;               // parsed JSON, or raw string on parse failure
  rawBody: string;
  timeMs:  number;          // wall-clock milliseconds
  raw:     APIResponse;     // underlying Playwright response
}
```

Available methods: `get`, `post`, `put`, `patch`, `delete` — all accept an optional `RequestOptions` object (`headers`, `params`, `data`, `form`, `multipart`, `timeout`).

An optional `logger` callback can be injected at construction time for request/response logging.

---

### 3. Resource Clients

**`src/clients/*.client.ts`**

Each resource extends `BaseApiClient` and exposes domain-specific methods with typed payloads and return types.

**Example — `PostClient`:**

```typescript
postsClient.getAll()                         // GET /posts
postsClient.getById(1)                       // GET /posts/1
postsClient.create({ userId, title, body })  // POST /posts
postsClient.updateById(1, { title })         // PUT /posts/1
```

To add a new resource, extend `BaseApiClient` and add it to the fixture.

---

### 4. Fixtures

**`src/fixtures/api.fixture.ts`**

Extends Playwright's `test` with pre-built API fixtures so tests can declare clients as parameters:

```typescript
import { test, expect } from '@fixtures/api.fixture';

test('example', async ({ postsClient }) => {
  const res = await postsClient.getById(1);
  expect(res).toHaveStatus(200);
});
```

The fixture manages `APIRequestContext` lifecycle (create → use → dispose) automatically.

> **Note:** Always import `test` and `expect` from `@fixtures/api.fixture` (not `@playwright/test`) when using resource clients or custom matchers.

---

### 5. Validators

#### Zod (`src/validators/zod-schema.ts`)

```typescript
// Throws on invalid data
const post   = parseSchema(PostSchema, raw);
const posts  = parseArraySchema(PostSchema, rawArray);

// Returns { success, data } or { success, error } — never throws
const result = safeParseSchema(PostSchema, raw);
```

#### JSONPath (`src/validators/jsonpath.helper.ts`)

| Function | Returns | Example |
| --- | --- | --- |
| `jsonPath(data, path)` | `T[]` | `jsonPath(posts, '$[?(@.userId==8)]')` |
| `jsonPathFirst(data, path)` | `T \| undefined` | `jsonPathFirst(post, '$.id')` |
| `jsonPathCount(data, path)` | `number` | `jsonPathCount(posts, '$[?(@.userId==8)]')` |
| `jsonPathExists(data, path)` | `boolean` | `jsonPathExists(post, '$.title')` |

JSONPath syntax quick reference:

```
$               root element
$.store.book    dot notation
$..title        recursive descent (any depth)
$[0]            array index
$[0:3]          array slice (indices 0, 1, 2)
$[?(@.price<10)]   filter — numeric comparison
$[?(@.userId==8)]  filter — equality
```

---

### 6. Custom Matchers

**`src/utils/custom-matchers.ts`**

Extends Playwright's `expect` with matchers that operate directly on `TimedResponse`. See the [Custom Matchers Reference](#custom-matchers-reference) section below.

---

## Writing Tests

### Raw Request Tests

Use Playwright's built-in `request` fixture for simple, low-overhead tests. The `baseURL` is provided by the active project in `playwright.config.ts`.

```typescript
import { test, expect } from '@playwright/test';

test('GET /posts/1 returns expected post', async ({ request }) => {
  const res = await request.get('/posts/1');

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.id).toBe(1);
});
```

---

### Client-Layer Tests

Use the typed resource client for richer assertions and response time access.

```typescript
import { test, expect } from '@fixtures/api.fixture';

test('GET /posts/1 via PostClient', async ({ postsClient }) => {
  const res = await postsClient.getById(1);

  expect(res).toHaveStatus(200);
  expect(res).toRespondWithin(4000);
  expect(res.body).toMatchObject({ id: 1, userId: 1 });
});
```

---

### Schema Validation Tests

Validate response shape at runtime using Zod.

```typescript
import { test, expect } from '@playwright/test';
import { parseSchema, PostSchema } from '@validators/zod-schema';

test('GET /posts/1 matches PostSchema', async ({ request }) => {
  const res  = await request.get('/posts/1');
  const raw  = await res.json();
  const post = parseSchema(PostSchema, raw);   // throws if invalid

  expect(post.userId).toBe(1);
});
```

---

### JSONPath Assertions

Assert on deeply nested fields or filtered subsets without intermediate variables.

```typescript
import { test, expect } from '@fixtures/api.fixture';

test('all posts for user 8 have correct userId', async ({ postsClient }) => {
  const res = await postsClient.getAll();

  expect(res).toHaveJsonPathCount('$[?(@.userId==8)]', 10);
  expect(res).toHaveJsonPath('$[0].id', 1);
  expect(res).toHaveJsonPathIncluding('$[*].userId', 8);
});
```

---

## Custom Matchers Reference

Import `expect` from `@fixtures/api.fixture` to access these matchers.

| Matcher | Description |
| --- | --- |
| `toHaveStatus(code)` | Asserts `response.status === code` |
| `toRespondWithin(ms)` | Asserts `response.timeMs <= ms` |
| `toHaveHeaderContaining(header, substring)` | Asserts the header value contains the substring (case-insensitive key) |
| `toHaveJsonPath(path, value)` | Asserts `jsonPathFirst(body, path)` deep-equals `value` |
| `toHaveJsonPathCount(path, n)` | Asserts `jsonPath(body, path).length === n` |
| `toHaveJsonPathIncluding(path, item)` | Asserts the JSONPath result array contains `item` |

All matchers support `.not` inversion:

```typescript
expect(res).not.toHaveStatus(404);
expect(res).not.toHaveHeaderContaining('content-type', 'xml');
```

---

## Configuration

### `playwright.config.ts`

| Setting | Value |
| --- | --- |
| `testDir` | `./tests` |
| `timeout` | 30 000 ms |
| `fullyParallel` | `true` |
| `retries` | 0 (local) / 2 (CI) |
| `workers` | 1 (local) / 2 (CI) |
| `reporter` | `list`, `html`, `json` → `test-results/results.json` |
| `trace` | `retain-on-failure` |

### Named Projects

| Project | Base URL |
| --- | --- |
| `jsonplaceholder` | `https://jsonplaceholder.typicode.com` |
| `restful-booker` | `https://restful-booker.herokuapp.com` |
| `dummyjson` | `https://dummyjson.com` |

### Path Aliases (`tsconfig.json`)

| Alias | Resolves to |
| --- | --- |
| `@clients/*` | `src/clients/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@specs/*` | `src/specs/*` |
| `@types/*` | `src/types/*` |
| `@utils/*` | `src/utils/*` |
| `@validators/*` | `src/validators/*` |
