import {expect as baseExpect} from "@playwright/test"
import { TimedResponse } from "@clients/base.client"
import {jsonPath, jsonPathFirst} from "../validators/jsonpath.helper"

export const expect = baseExpect.extend( {


    toRespondWithin(received: TimedResponse, maxMs: number){

        const pass = received.timeMs <= maxMs;

        return{
            pass,
            message:() => 
                pass
                 ? `Expected response time to exceed ${maxMs}ms, but was ${received.timeMs}ms`
                 : `Expected response within ${maxMs}ms but took ${received.timeMs}ms`,
            name: 'toRespondWithin', 
        }
    },

    toHaveStatus(received: TimedResponse, expected: number){
        const pass = received.status === expected
        
        return {
            pass,
            message: () => 
                pass
                ? `Expected status NOT to be ${expected}`
                : `Expected status ${expected} but got ${received.status} \nResponse body: ${received.rawBody.slice(0,500)}`,
            name: 'toHaveStatus'
        }

    },

    /**
   * Assert a header exists and matches a pattern.
   *
   * Rest Assured: .header("Content-Type", containsString("json"))
   * Here:         expect(res).toHaveHeaderContaining('content-type', 'json')
   */
  toHaveHeaderContaining(received: TimedResponse, header: string, substring: string) {
    const value = received.headers[header.toLowerCase()] || '';
    const pass = value.includes(substring);
    return {
      pass,
      message: () =>
        pass
          ? `Expected header '${header}' NOT to contain '${substring}'`
          : `Expected header '${header}' to contain '${substring}' but got '${value}'`,
      name: 'toHaveHeaderContaining',
    };
  },

  /**
   * Assert a JSONPath expression returns a specific value.
   *
   * Rest Assured: .body("data[0].id", equalTo(1))
   * Here:         expect(res).toHaveJsonPath('$[0].id', 1)
   */
  toHaveJsonPath(received: TimedResponse, path: string, expectedValue: unknown) {
    const actual = jsonPathFirst(received.body, path);
    const pass = JSON.stringify(actual) === JSON.stringify(expectedValue);
    return {
      pass,
      message: () =>
        pass
          ? `Expected JSONPath '${path}' NOT to equal ${JSON.stringify(expectedValue)}`
          : `Expected JSONPath '${path}' to equal ${JSON.stringify(expectedValue)} but got ${JSON.stringify(actual)}`,
      name: 'toHaveJsonPath',
    };
  },

  /**
   * Assert a JSONPath expression returns a specific number of results.
   *
   * Rest Assured: .body("findAll { it.userId == 8 }", hasSize(10))
   * Here:         expect(res).toHaveJsonPathCount('$[?(@.userId==8)]', 10)
   */
  toHaveJsonPathCount(received: TimedResponse, path: string, expectedCount: number) {
    const results = jsonPath(received.body, path);
    const pass = results.length === expectedCount;
    return {
      pass,
      message: () =>
        pass
          ? `Expected JSONPath '${path}' NOT to have ${expectedCount} results`
          : `Expected JSONPath '${path}' to have ${expectedCount} results but got ${results.length}`,
      name: 'toHaveJsonPathCount',
    };
  },

  /**
   * Assert a JSONPath result array includes a specific value.
   *
   * Rest Assured: .body("collect { it.id }", hasItem(42))
   * Here:         expect(res).toHaveJsonPathIncluding('$[*].id', 42)
   */
  toHaveJsonPathIncluding(received: TimedResponse, path: string, expectedItem: unknown) {
    const results = jsonPath(received.body, path);
    const pass = results.some(
      (r) => JSON.stringify(r) === JSON.stringify(expectedItem),
    );
    return {
      pass,
      message: () =>
        pass
          ? `Expected JSONPath '${path}' NOT to include ${JSON.stringify(expectedItem)}`
          : `Expected JSONPath '${path}' to include ${JSON.stringify(expectedItem)} but it didn't.\nActual results: ${JSON.stringify(results.slice(0, 10))}...`,
      name: 'toHaveJsonPathIncluding',
    };
  },
});

