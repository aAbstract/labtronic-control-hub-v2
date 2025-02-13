// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion, error will be thrown if `expr` does not have truthy value.
 *
 * @example Usage
 * ```ts ignore
 * import { assert } from "@std/assert";
 *
 * assert("hello".includes("ello")); // Doesn't throw
 * assert("hello".includes("world")); // Throws
 * ```
 *
 * @param expr The expression to test.
 * @param msg The optional message to display if the assertion fails.
 */ export function assert(expr, msg = "") {
  if (!expr) {
    throw new AssertionError(msg);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2Fzc2VydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiwgZXJyb3Igd2lsbCBiZSB0aHJvd24gaWYgYGV4cHJgIGRvZXMgbm90IGhhdmUgdHJ1dGh5IHZhbHVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydChcImhlbGxvXCIuaW5jbHVkZXMoXCJlbGxvXCIpKTsgLy8gRG9lc24ndCB0aHJvd1xuICogYXNzZXJ0KFwiaGVsbG9cIi5pbmNsdWRlcyhcIndvcmxkXCIpKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gZXhwciBUaGUgZXhwcmVzc2lvbiB0byB0ZXN0LlxuICogQHBhcmFtIG1zZyBUaGUgb3B0aW9uYWwgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZSBhc3NlcnRpb24gZmFpbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnQoZXhwcjogdW5rbm93biwgbXNnID0gXCJcIik6IGFzc2VydHMgZXhwciB7XG4gIGlmICghZXhwcikge1xuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLGNBQWMsUUFBUSx1QkFBdUI7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Q0FhQyxHQUNELE9BQU8sU0FBUyxPQUFPLElBQWEsRUFBRSxNQUFNLEVBQUU7RUFDNUMsSUFBSSxDQUFDLE1BQU07SUFDVCxNQUFNLElBQUksZUFBZTtFQUMzQjtBQUNGIn0=
// denoCacheMetadata=703417697327385853,13754261759535142915