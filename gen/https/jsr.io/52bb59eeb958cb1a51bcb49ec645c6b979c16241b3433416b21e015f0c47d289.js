// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
import { format } from "jsr:@std/internal@^1.0.4/format";
/**
 * Make an assertion that `actual` and `expected` are not strictly equal, using
 * {@linkcode Object.is} for equality comparison. If the values are strictly
 * equal then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertNotStrictEquals } from "@std/assert";
 *
 * assertNotStrictEquals(1, 1); // Throws
 * assertNotStrictEquals(1, 2); // Doesn't throw
 *
 * assertNotStrictEquals(0, 0); // Throws
 * assertNotStrictEquals(0, -0); // Doesn't throw
 * ```
 *
 * @typeParam T The type of the values to compare.
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertNotStrictEquals(actual, expected, msg) {
  if (!Object.is(actual, expected)) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Expected "actual" to not be strictly equal to: ${format(actual)}${msgSuffix}\n`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L25vdF9zdHJpY3RfZXF1YWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gXCIuL2Fzc2VydGlvbl9lcnJvci50c1wiO1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcImpzcjpAc3RkL2ludGVybmFsQF4xLjAuNC9mb3JtYXRcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIGFyZSBub3Qgc3RyaWN0bHkgZXF1YWwsIHVzaW5nXG4gKiB7QGxpbmtjb2RlIE9iamVjdC5pc30gZm9yIGVxdWFsaXR5IGNvbXBhcmlzb24uIElmIHRoZSB2YWx1ZXMgYXJlIHN0cmljdGx5XG4gKiBlcXVhbCB0aGVuIHRocm93LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGFzc2VydE5vdFN0cmljdEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydE5vdFN0cmljdEVxdWFscygxLCAxKTsgLy8gVGhyb3dzXG4gKiBhc3NlcnROb3RTdHJpY3RFcXVhbHMoMSwgMik7IC8vIERvZXNuJ3QgdGhyb3dcbiAqXG4gKiBhc3NlcnROb3RTdHJpY3RFcXVhbHMoMCwgMCk7IC8vIFRocm93c1xuICogYXNzZXJ0Tm90U3RyaWN0RXF1YWxzKDAsIC0wKTsgLy8gRG9lc24ndCB0aHJvd1xuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZXMgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSBhY3R1YWwgVGhlIGFjdHVhbCB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIGV4cGVjdGVkIFRoZSBleHBlY3RlZCB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIG1zZyBUaGUgb3B0aW9uYWwgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZSBhc3NlcnRpb24gZmFpbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb3RTdHJpY3RFcXVhbHM8VD4oXG4gIGFjdHVhbDogVCxcbiAgZXhwZWN0ZWQ6IFQsXG4gIG1zZz86IHN0cmluZyxcbikge1xuICBpZiAoIU9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFxuICAgIGBFeHBlY3RlZCBcImFjdHVhbFwiIHRvIG5vdCBiZSBzdHJpY3RseSBlcXVhbCB0bzogJHtcbiAgICAgIGZvcm1hdChhY3R1YWwpXG4gICAgfSR7bXNnU3VmZml4fVxcbmAsXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLGNBQWMsUUFBUSx1QkFBdUI7QUFDdEQsU0FBUyxNQUFNLFFBQVEsa0NBQWtDO0FBRXpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CQyxHQUNELE9BQU8sU0FBUyxzQkFDZCxNQUFTLEVBQ1QsUUFBVyxFQUNYLEdBQVk7RUFFWixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxXQUFXO0lBQ2hDO0VBQ0Y7RUFFQSxNQUFNLFlBQVksTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRztFQUNyQyxNQUFNLElBQUksZUFDUixDQUFDLCtDQUErQyxFQUM5QyxPQUFPLFFBQ1IsRUFBRSxVQUFVLEVBQUUsQ0FBQztBQUVwQiJ9
// denoCacheMetadata=534697866050410777,3157249365633658401