// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` not match RegExp `expected`. If match
 * then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertNotMatch } from "@std/assert";
 *
 * assertNotMatch("Denosaurus", /Raptor/); // Doesn't throw
 * assertNotMatch("Raptor", /Raptor/); // Throws
 * ```
 *
 * @param actual The actual value to match.
 * @param expected The expected value to not match.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertNotMatch(actual, expected, msg) {
  if (!expected.test(actual)) return;
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${actual}" to not match: "${expected}"${msgSuffix}`;
  throw new AssertionError(msg);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L25vdF9tYXRjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIG5vdCBtYXRjaCBSZWdFeHAgYGV4cGVjdGVkYC4gSWYgbWF0Y2hcbiAqIHRoZW4gdGhyb3cuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzIGlnbm9yZVxuICogaW1wb3J0IHsgYXNzZXJ0Tm90TWF0Y2ggfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnROb3RNYXRjaChcIkRlbm9zYXVydXNcIiwgL1JhcHRvci8pOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnROb3RNYXRjaChcIlJhcHRvclwiLCAvUmFwdG9yLyk7IC8vIFRocm93c1xuICogYGBgXG4gKlxuICogQHBhcmFtIGFjdHVhbCBUaGUgYWN0dWFsIHZhbHVlIHRvIG1hdGNoLlxuICogQHBhcmFtIGV4cGVjdGVkIFRoZSBleHBlY3RlZCB2YWx1ZSB0byBub3QgbWF0Y2guXG4gKiBAcGFyYW0gbXNnIFRoZSBvcHRpb25hbCBtZXNzYWdlIHRvIGRpc3BsYXkgaWYgdGhlIGFzc2VydGlvbiBmYWlscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vdE1hdGNoKFxuICBhY3R1YWw6IHN0cmluZyxcbiAgZXhwZWN0ZWQ6IFJlZ0V4cCxcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIGlmICghZXhwZWN0ZWQudGVzdChhY3R1YWwpKSByZXR1cm47XG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgbXNnID0gYEV4cGVjdGVkIGFjdHVhbDogXCIke2FjdHVhbH1cIiB0byBub3QgbWF0Y2g6IFwiJHtleHBlY3RlZH1cIiR7bXNnU3VmZml4fWA7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBUyxlQUNkLE1BQWMsRUFDZCxRQUFnQixFQUNoQixHQUFZO0VBRVosSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLFNBQVM7RUFDNUIsTUFBTSxZQUFZLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUc7RUFDckMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLE9BQU8saUJBQWlCLEVBQUUsU0FBUyxDQUFDLEVBQUUsVUFBVSxDQUFDO0VBQzVFLE1BQU0sSUFBSSxlQUFlO0FBQzNCIn0=
// denoCacheMetadata=16842934874965083098,9922994102320153248