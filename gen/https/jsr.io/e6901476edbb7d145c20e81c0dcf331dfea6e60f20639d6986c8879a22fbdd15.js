// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { format } from "jsr:@std/internal@^1.0.4/format";
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` is less than or equal to `expected`.
 * If not then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertLessOrEqual } from "@std/assert";
 *
 * assertLessOrEqual(1, 2); // Doesn't throw
 * assertLessOrEqual(1, 1); // Doesn't throw
 * assertLessOrEqual(1, 0); // Throws
 * ```
 *
 * @typeParam T The type of the values to compare.
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertLessOrEqual(actual, expected, msg) {
  if (actual <= expected) return;
  const actualString = format(actual);
  const expectedString = format(expected);
  throw new AssertionError(msg ?? `Expect ${actualString} <= ${expectedString}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2xlc3Nfb3JfZXF1YWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCJqc3I6QHN0ZC9pbnRlcm5hbEBeMS4wLjQvZm9ybWF0XCI7XG5pbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gXCIuL2Fzc2VydGlvbl9lcnJvci50c1wiO1xuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gKiBJZiBub3QgdGhlbiB0aHJvdy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgaWdub3JlXG4gKiBpbXBvcnQgeyBhc3NlcnRMZXNzT3JFcXVhbCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydExlc3NPckVxdWFsKDEsIDIpOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnRMZXNzT3JFcXVhbCgxLCAxKTsgLy8gRG9lc24ndCB0aHJvd1xuICogYXNzZXJ0TGVzc09yRXF1YWwoMSwgMCk7IC8vIFRocm93c1xuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZXMgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSBhY3R1YWwgVGhlIGFjdHVhbCB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIGV4cGVjdGVkIFRoZSBleHBlY3RlZCB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIG1zZyBUaGUgb3B0aW9uYWwgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZSBhc3NlcnRpb24gZmFpbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRMZXNzT3JFcXVhbDxUPihcbiAgYWN0dWFsOiBULFxuICBleHBlY3RlZDogVCxcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIGlmIChhY3R1YWwgPD0gZXhwZWN0ZWQpIHJldHVybjtcblxuICBjb25zdCBhY3R1YWxTdHJpbmcgPSBmb3JtYXQoYWN0dWFsKTtcbiAgY29uc3QgZXhwZWN0ZWRTdHJpbmcgPSBmb3JtYXQoZXhwZWN0ZWQpO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoXG4gICAgbXNnID8/IGBFeHBlY3QgJHthY3R1YWxTdHJpbmd9IDw9ICR7ZXhwZWN0ZWRTdHJpbmd9YCxcbiAgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsTUFBTSxRQUFRLGtDQUFrQztBQUN6RCxTQUFTLGNBQWMsUUFBUSx1QkFBdUI7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJDLEdBQ0QsT0FBTyxTQUFTLGtCQUNkLE1BQVMsRUFDVCxRQUFXLEVBQ1gsR0FBWTtFQUVaLElBQUksVUFBVSxVQUFVO0VBRXhCLE1BQU0sZUFBZSxPQUFPO0VBQzVCLE1BQU0saUJBQWlCLE9BQU87RUFDOUIsTUFBTSxJQUFJLGVBQ1IsT0FBTyxDQUFDLE9BQU8sRUFBRSxhQUFhLElBQUksRUFBRSxlQUFlLENBQUM7QUFFeEQifQ==
// denoCacheMetadata=1190075087032801256,7195810634956050690