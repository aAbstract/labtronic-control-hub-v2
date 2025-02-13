// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { equal } from "./equal.ts";
import { buildMessage } from "jsr:@std/internal@^1.0.4/build-message";
import { diff } from "jsr:@std/internal@^1.0.4/diff";
import { diffStr } from "jsr:@std/internal@^1.0.4/diff-str";
import { format } from "jsr:@std/internal@^1.0.4/format";
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` and `expected` are equal, deeply. If not
 * deeply equal, then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the
 * same type.
 *
 * @example Usage
 * ```ts ignore
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals("world", "world"); // Doesn't throw
 * assertEquals("hello", "world"); // Throws
 * ```
 *
 * @typeParam T The type of the values to compare. This is usually inferred.
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertEquals(actual, expected, msg) {
  if (equal(actual, expected)) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  let message = `Values are not equal${msgSuffix}`;
  const actualString = format(actual);
  const expectedString = format(expected);
  const stringDiff = typeof actual === "string" && typeof expected === "string";
  const diffResult = stringDiff ? diffStr(actual, expected) : diff(actualString.split("\n"), expectedString.split("\n"));
  const diffMsg = buildMessage(diffResult, {
    stringDiff
  }).join("\n");
  message = `${message}\n${diffMsg}`;
  throw new AssertionError(message);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2VxdWFscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgZXF1YWwgfSBmcm9tIFwiLi9lcXVhbC50c1wiO1xuaW1wb3J0IHsgYnVpbGRNZXNzYWdlIH0gZnJvbSBcImpzcjpAc3RkL2ludGVybmFsQF4xLjAuNC9idWlsZC1tZXNzYWdlXCI7XG5pbXBvcnQgeyBkaWZmIH0gZnJvbSBcImpzcjpAc3RkL2ludGVybmFsQF4xLjAuNC9kaWZmXCI7XG5pbXBvcnQgeyBkaWZmU3RyIH0gZnJvbSBcImpzcjpAc3RkL2ludGVybmFsQF4xLjAuNC9kaWZmLXN0clwiO1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcImpzcjpAc3RkL2ludGVybmFsQF4xLjAuNC9mb3JtYXRcIjtcblxuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIGFyZSBlcXVhbCwgZGVlcGx5LiBJZiBub3RcbiAqIGRlZXBseSBlcXVhbCwgdGhlbiB0aHJvdy5cbiAqXG4gKiBUeXBlIHBhcmFtZXRlciBjYW4gYmUgc3BlY2lmaWVkIHRvIGVuc3VyZSB2YWx1ZXMgdW5kZXIgY29tcGFyaXNvbiBoYXZlIHRoZVxuICogc2FtZSB0eXBlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhcIndvcmxkXCIsIFwid29ybGRcIik7IC8vIERvZXNuJ3QgdGhyb3dcbiAqIGFzc2VydEVxdWFscyhcImhlbGxvXCIsIFwid29ybGRcIik7IC8vIFRocm93c1xuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZXMgdG8gY29tcGFyZS4gVGhpcyBpcyB1c3VhbGx5IGluZmVycmVkLlxuICogQHBhcmFtIGFjdHVhbCBUaGUgYWN0dWFsIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gZXhwZWN0ZWQgVGhlIGV4cGVjdGVkIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gbXNnIFRoZSBvcHRpb25hbCBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlIGFzc2VydGlvbiBmYWlscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEVxdWFsczxUPihcbiAgYWN0dWFsOiBULFxuICBleHBlY3RlZDogVCxcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIGlmIChlcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIGxldCBtZXNzYWdlID0gYFZhbHVlcyBhcmUgbm90IGVxdWFsJHttc2dTdWZmaXh9YDtcblxuICBjb25zdCBhY3R1YWxTdHJpbmcgPSBmb3JtYXQoYWN0dWFsKTtcbiAgY29uc3QgZXhwZWN0ZWRTdHJpbmcgPSBmb3JtYXQoZXhwZWN0ZWQpO1xuICBjb25zdCBzdHJpbmdEaWZmID0gKHR5cGVvZiBhY3R1YWwgPT09IFwic3RyaW5nXCIpICYmXG4gICAgKHR5cGVvZiBleHBlY3RlZCA9PT0gXCJzdHJpbmdcIik7XG4gIGNvbnN0IGRpZmZSZXN1bHQgPSBzdHJpbmdEaWZmXG4gICAgPyBkaWZmU3RyKGFjdHVhbCBhcyBzdHJpbmcsIGV4cGVjdGVkIGFzIHN0cmluZylcbiAgICA6IGRpZmYoYWN0dWFsU3RyaW5nLnNwbGl0KFwiXFxuXCIpLCBleHBlY3RlZFN0cmluZy5zcGxpdChcIlxcblwiKSk7XG4gIGNvbnN0IGRpZmZNc2cgPSBidWlsZE1lc3NhZ2UoZGlmZlJlc3VsdCwgeyBzdHJpbmdEaWZmIH0pLmpvaW4oXCJcXG5cIik7XG4gIG1lc3NhZ2UgPSBgJHttZXNzYWdlfVxcbiR7ZGlmZk1zZ31gO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobWVzc2FnZSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLEtBQUssUUFBUSxhQUFhO0FBQ25DLFNBQVMsWUFBWSxRQUFRLHlDQUF5QztBQUN0RSxTQUFTLElBQUksUUFBUSxnQ0FBZ0M7QUFDckQsU0FBUyxPQUFPLFFBQVEsb0NBQW9DO0FBQzVELFNBQVMsTUFBTSxRQUFRLGtDQUFrQztBQUV6RCxTQUFTLGNBQWMsUUFBUSx1QkFBdUI7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQkMsR0FDRCxPQUFPLFNBQVMsYUFDZCxNQUFTLEVBQ1QsUUFBVyxFQUNYLEdBQVk7RUFFWixJQUFJLE1BQU0sUUFBUSxXQUFXO0lBQzNCO0VBQ0Y7RUFDQSxNQUFNLFlBQVksTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRztFQUNyQyxJQUFJLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxVQUFVLENBQUM7RUFFaEQsTUFBTSxlQUFlLE9BQU87RUFDNUIsTUFBTSxpQkFBaUIsT0FBTztFQUM5QixNQUFNLGFBQWEsQUFBQyxPQUFPLFdBQVcsWUFDbkMsT0FBTyxhQUFhO0VBQ3ZCLE1BQU0sYUFBYSxhQUNmLFFBQVEsUUFBa0IsWUFDMUIsS0FBSyxhQUFhLEtBQUssQ0FBQyxPQUFPLGVBQWUsS0FBSyxDQUFDO0VBQ3hELE1BQU0sVUFBVSxhQUFhLFlBQVk7SUFBRTtFQUFXLEdBQUcsSUFBSSxDQUFDO0VBQzlELFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLFFBQVEsQ0FBQztFQUNsQyxNQUFNLElBQUksZUFBZTtBQUMzQiJ9
// denoCacheMetadata=4921334071080166513,2289387457320864062