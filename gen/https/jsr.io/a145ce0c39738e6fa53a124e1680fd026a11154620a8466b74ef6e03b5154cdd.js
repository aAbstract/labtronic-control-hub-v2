// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { format } from "jsr:@std/internal@^1.0.4/format";
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` is less than `expected`.
 * If not then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertLess } from "@std/assert";
 *
 * assertLess(1, 2); // Doesn't throw
 * assertLess(2, 1); // Throws
 * ```
 *
 * @typeParam T The type of the values to compare.
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertLess(actual, expected, msg) {
  if (actual < expected) return;
  const actualString = format(actual);
  const expectedString = format(expected);
  throw new AssertionError(msg ?? `Expect ${actualString} < ${expectedString}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2xlc3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCJqc3I6QHN0ZC9pbnRlcm5hbEBeMS4wLjQvZm9ybWF0XCI7XG5pbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gXCIuL2Fzc2VydGlvbl9lcnJvci50c1wiO1xuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgaXMgbGVzcyB0aGFuIGBleHBlY3RlZGAuXG4gKiBJZiBub3QgdGhlbiB0aHJvdy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgaWdub3JlXG4gKiBpbXBvcnQgeyBhc3NlcnRMZXNzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0TGVzcygxLCAyKTsgLy8gRG9lc24ndCB0aHJvd1xuICogYXNzZXJ0TGVzcygyLCAxKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqXG4gKiBAdHlwZVBhcmFtIFQgVGhlIHR5cGUgb2YgdGhlIHZhbHVlcyB0byBjb21wYXJlLlxuICogQHBhcmFtIGFjdHVhbCBUaGUgYWN0dWFsIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gZXhwZWN0ZWQgVGhlIGV4cGVjdGVkIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gbXNnIFRoZSBvcHRpb25hbCBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlIGFzc2VydGlvbiBmYWlscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydExlc3M8VD4oYWN0dWFsOiBULCBleHBlY3RlZDogVCwgbXNnPzogc3RyaW5nKSB7XG4gIGlmIChhY3R1YWwgPCBleHBlY3RlZCkgcmV0dXJuO1xuXG4gIGNvbnN0IGFjdHVhbFN0cmluZyA9IGZvcm1hdChhY3R1YWwpO1xuICBjb25zdCBleHBlY3RlZFN0cmluZyA9IGZvcm1hdChleHBlY3RlZCk7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cgPz8gYEV4cGVjdCAke2FjdHVhbFN0cmluZ30gPCAke2V4cGVjdGVkU3RyaW5nfWApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxNQUFNLFFBQVEsa0NBQWtDO0FBQ3pELFNBQVMsY0FBYyxRQUFRLHVCQUF1QjtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sU0FBUyxXQUFjLE1BQVMsRUFBRSxRQUFXLEVBQUUsR0FBWTtFQUNoRSxJQUFJLFNBQVMsVUFBVTtFQUV2QixNQUFNLGVBQWUsT0FBTztFQUM1QixNQUFNLGlCQUFpQixPQUFPO0VBQzlCLE1BQU0sSUFBSSxlQUFlLE9BQU8sQ0FBQyxPQUFPLEVBQUUsYUFBYSxHQUFHLEVBQUUsZUFBZSxDQUFDO0FBQzlFIn0=
// denoCacheMetadata=5375835818367867504,12259828571474949085