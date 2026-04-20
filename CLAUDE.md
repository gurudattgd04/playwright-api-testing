# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests
npm test

# Run tests by feature area (uses named projects from playwright.config.ts)
npm run test:posts        # jsonplaceholder project
npm run test:booking      # restful-booker project
npm run test:product      # dummyjson project
npm run test:auth

# Run a single test file
npx playwright test tests/posts/m1-smoke.spec.ts --project=jsonplaceholder

# Run a single test by title
npx playwright test --grep "GET /posts/1" --project=jsonplaceholder

# Debug mode (opens Playwright inspector)
npm run test:debug

# Open HTML report after a run
npm run test:report

# Type check without running tests
npm run typecheck
```

## Architecture

This is a Playwright-based API test framework. Tests call real external APIs; there is no mocking layer.

### Layer model (bottom to top)

1. **`src/specs/request.spec.ts`** — `RequestSpec` builder: constructs an `APIRequestContext` with base URL, headers, auth (Bearer, Basic, API key). Pre-built factories: `jsonPlaceholderSpec()`, `restfulBookerSpec()`, `dummyJsonSpec()`.

2. **`src/clients/base.client.ts`** — `BaseApiClient`: wraps `APIRequestContext` with typed `get/post/put/patch/delete` helpers. Every call returns `TimedResponse<T>` which includes `status`, `headers`, `body` (parsed JSON), `rawBody`, `timeMs`, and the raw `APIResponse`.

3. **`src/clients/*.client.ts`** — Resource-specific clients (e.g. `PostClient`) extend `BaseApiClient` and expose domain methods like `getById(id)`, `create(payload)`.

4. **`src/fixtures/api.fixture.ts`** — Playwright `test.extend` fixture that wires together a `RequestSpec` context and the resource clients. Tests that need typed clients import `test` and `expect` from here instead of `@playwright/test`.

5. **`src/validators/`** — Two validation strategies:
   - **Zod** (`zod-schema.ts`): `parseSchema`, `parseArraySchema`, `safeParseSchema` helpers around Zod schemas.
   - **JSONPath** (`jsonpath.helper.ts`): `jsonPath`, `jsonPathFirst`, `jsonPathCount`, `jsonPathExists` — GPath-style body assertions backed by `jsonpath-plus`.

6. **`src/utils/custom-matchers.ts`** — Extended `expect` with API-specific matchers: `toHaveStatus`, `toRespondWithin`, `toHaveHeaderContaining`, `toHaveJsonPath`, `toHaveJsonPathCount`, `toHaveJsonPathIncluding`. Import `expect` from here (re-exported via the fixture) to use them.

### Projects / base URLs

Defined in `playwright.config.ts`. Each named project sets a `baseURL`:

| Project name | Base URL |
|---|---|
| `jsonplaceholder` | `https://jsonplaceholder.typicode.com` |
| `restful-booker` | `https://restful-booker.herokuapp.com` |
| `dummyjson` | `https://dummyjson.com` |

Tests under `tests/posts/` must be run with `--project=jsonplaceholder` (or via `npm run test:posts`).

### Path aliases (tsconfig.json)

| Alias | Maps to |
|---|---|
| `@clients/*` | `src/clients/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@specs/*` | `src/specs/*` |
| `@types/*` | `src/types/*` |
| `@utils/*` | `src/utils/*` |
| `@validators/*` | `src/validators/*` |

### Test patterns

- **Low-level tests** (e.g. `m1-smoke.spec.ts`): use `request` fixture from `@playwright/test` directly — no client layer.
- **Client-layer tests**: import `test`/`expect` from `@fixtures/api.fixture` to get typed clients.
- **Schema validation tests**: import Zod helpers from `@validators/zod-schema` and call `parseSchema` / `parseArraySchema` on `response.json()`.
