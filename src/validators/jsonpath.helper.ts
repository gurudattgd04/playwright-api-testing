/**
 * JSONPath Helper — Equivalent to Rest Assured's GPath.
 *
 * Rest Assured (GPath):
 *   .body("findAll { it.userId == 8 }.title", hasSize(10))
 *   .body("[0].id", equalTo(1))
 *
 * Playwright + JSONPath:
 *   jsonPath(posts, '$[?(@.userId==8)].title')  → string[]
 *   jsonPathFirst(posts, '$[0].id')              → number
 *
 * Syntax cheat sheet:
 *   $              → root
 *   $.store.book   → dot notation
 *   $..title       → recursive descent (find 'title' at ANY depth)
 *   $[0]           → array index
 *   $[0,1]         → multiple indices
 *   $[0:3]         → slice (0, 1, 2)
 *   $[?(@.price<10)]  → filter expression
 *   $[?(@.userId==8)]  → equality filter
 */
import pkg from 'jsonpath-plus';
const { JSONPath } = pkg;

export function jsonPath<T = unknown>(data:unknown, path:string): T[] {
 
    return JSONPath<T[]>({path, json: data as object, wrap: true})
}

export function jsonPathFirst<T =unknown>(data: unknown, path: string): T | undefined {
    const results = jsonPath<T>(data, path);
    return results[0]
}

export function jsonPathCount(data: unknown, path: string): number {
    return jsonPath(data, path).length
}

export function jsonPathExists(data: unknown, path: string): boolean {
    return jsonPath(data, path).length > 0
}