// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that actual includes expected. If not
 * then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertStringIncludes } from "@std/assert";
 *
 * assertStringIncludes("Hello", "ello"); // Doesn't throw
 * assertStringIncludes("Hello", "world"); // Throws
 * ```
 *
 * @param actual The actual string to check for inclusion.
 * @param expected The expected string to check for inclusion.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertStringIncludes(actual, expected, msg) {
  if (actual.includes(expected)) return;
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${actual}" to contain: "${expected}"${msgSuffix}`;
  throw new AssertionError(msg);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L3N0cmluZ19pbmNsdWRlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGFjdHVhbCBpbmNsdWRlcyBleHBlY3RlZC4gSWYgbm90XG4gKiB0aGVuIHRocm93LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGFzc2VydFN0cmluZ0luY2x1ZGVzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0U3RyaW5nSW5jbHVkZXMoXCJIZWxsb1wiLCBcImVsbG9cIik7IC8vIERvZXNuJ3QgdGhyb3dcbiAqIGFzc2VydFN0cmluZ0luY2x1ZGVzKFwiSGVsbG9cIiwgXCJ3b3JsZFwiKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gYWN0dWFsIFRoZSBhY3R1YWwgc3RyaW5nIHRvIGNoZWNrIGZvciBpbmNsdXNpb24uXG4gKiBAcGFyYW0gZXhwZWN0ZWQgVGhlIGV4cGVjdGVkIHN0cmluZyB0byBjaGVjayBmb3IgaW5jbHVzaW9uLlxuICogQHBhcmFtIG1zZyBUaGUgb3B0aW9uYWwgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZSBhc3NlcnRpb24gZmFpbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRTdHJpbmdJbmNsdWRlcyhcbiAgYWN0dWFsOiBzdHJpbmcsXG4gIGV4cGVjdGVkOiBzdHJpbmcsXG4gIG1zZz86IHN0cmluZyxcbikge1xuICBpZiAoYWN0dWFsLmluY2x1ZGVzKGV4cGVjdGVkKSkgcmV0dXJuO1xuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIG1zZyA9IGBFeHBlY3RlZCBhY3R1YWw6IFwiJHthY3R1YWx9XCIgdG8gY29udGFpbjogXCIke2V4cGVjdGVkfVwiJHttc2dTdWZmaXh9YDtcbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLGNBQWMsUUFBUSx1QkFBdUI7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLHFCQUNkLE1BQWMsRUFDZCxRQUFnQixFQUNoQixHQUFZO0VBRVosSUFBSSxPQUFPLFFBQVEsQ0FBQyxXQUFXO0VBQy9CLE1BQU0sWUFBWSxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHO0VBQ3JDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLGVBQWUsRUFBRSxTQUFTLENBQUMsRUFBRSxVQUFVLENBQUM7RUFDMUUsTUFBTSxJQUFJLGVBQWU7QUFDM0IifQ==
// denoCacheMetadata=16732657551073395623,13963001381541113658