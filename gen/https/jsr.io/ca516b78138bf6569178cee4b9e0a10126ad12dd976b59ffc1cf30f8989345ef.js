// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { equal } from "./equal.ts";
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` and `expected` are not equal, deeply.
 * If not then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 *
 * @example Usage
 * ```ts ignore
 * import { assertNotEquals } from "@std/assert";
 *
 * assertNotEquals(1, 2); // Doesn't throw
 * assertNotEquals(1, 1); // Throws
 * ```
 *
 * @typeParam T The type of the values to compare.
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertNotEquals(actual, expected, msg) {
  if (!equal(actual, expected)) {
    return;
  }
  const actualString = String(actual);
  const expectedString = String(expected);
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Expected actual: ${actualString} not to be: ${expectedString}${msgSuffix}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L25vdF9lcXVhbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgZXF1YWwgfSBmcm9tIFwiLi9lcXVhbC50c1wiO1xuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIGFyZSBub3QgZXF1YWwsIGRlZXBseS5cbiAqIElmIG5vdCB0aGVuIHRocm93LlxuICpcbiAqIFR5cGUgcGFyYW1ldGVyIGNhbiBiZSBzcGVjaWZpZWQgdG8gZW5zdXJlIHZhbHVlcyB1bmRlciBjb21wYXJpc29uIGhhdmUgdGhlIHNhbWUgdHlwZS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgaWdub3JlXG4gKiBpbXBvcnQgeyBhc3NlcnROb3RFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnROb3RFcXVhbHMoMSwgMik7IC8vIERvZXNuJ3QgdGhyb3dcbiAqIGFzc2VydE5vdEVxdWFscygxLCAxKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqXG4gKiBAdHlwZVBhcmFtIFQgVGhlIHR5cGUgb2YgdGhlIHZhbHVlcyB0byBjb21wYXJlLlxuICogQHBhcmFtIGFjdHVhbCBUaGUgYWN0dWFsIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gZXhwZWN0ZWQgVGhlIGV4cGVjdGVkIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gbXNnIFRoZSBvcHRpb25hbCBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlIGFzc2VydGlvbiBmYWlscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vdEVxdWFsczxUPihhY3R1YWw6IFQsIGV4cGVjdGVkOiBULCBtc2c/OiBzdHJpbmcpIHtcbiAgaWYgKCFlcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBhY3R1YWxTdHJpbmcgPSBTdHJpbmcoYWN0dWFsKTtcbiAgY29uc3QgZXhwZWN0ZWRTdHJpbmcgPSBTdHJpbmcoZXhwZWN0ZWQpO1xuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihcbiAgICBgRXhwZWN0ZWQgYWN0dWFsOiAke2FjdHVhbFN0cmluZ30gbm90IHRvIGJlOiAke2V4cGVjdGVkU3RyaW5nfSR7bXNnU3VmZml4fWAsXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLEtBQUssUUFBUSxhQUFhO0FBQ25DLFNBQVMsY0FBYyxRQUFRLHVCQUF1QjtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxTQUFTLGdCQUFtQixNQUFTLEVBQUUsUUFBVyxFQUFFLEdBQVk7RUFDckUsSUFBSSxDQUFDLE1BQU0sUUFBUSxXQUFXO0lBQzVCO0VBQ0Y7RUFDQSxNQUFNLGVBQWUsT0FBTztFQUM1QixNQUFNLGlCQUFpQixPQUFPO0VBQzlCLE1BQU0sWUFBWSxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHO0VBQ3JDLE1BQU0sSUFBSSxlQUNSLENBQUMsaUJBQWlCLEVBQUUsYUFBYSxZQUFZLEVBQUUsZUFBZSxFQUFFLFVBQVUsQ0FBQztBQUUvRSJ9
// denoCacheMetadata=1981645850771686236,7276582324858173641