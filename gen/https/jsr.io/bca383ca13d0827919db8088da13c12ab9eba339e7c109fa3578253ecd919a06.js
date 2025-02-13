// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Use this to assert unreachable code.
 *
 * @example Usage
 * ```ts ignore
 * import { unreachable } from "@std/assert";
 *
 * unreachable(); // Throws
 * ```
 *
 * @param msg Optional message to include in the error.
 * @returns Never returns, always throws.
 */ export function unreachable(msg) {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Unreachable${msgSuffix}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L3VucmVhY2hhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gXCIuL2Fzc2VydGlvbl9lcnJvci50c1wiO1xuXG4vKipcbiAqIFVzZSB0aGlzIHRvIGFzc2VydCB1bnJlYWNoYWJsZSBjb2RlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IHVucmVhY2hhYmxlIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogdW5yZWFjaGFibGUoKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gbXNnIE9wdGlvbmFsIG1lc3NhZ2UgdG8gaW5jbHVkZSBpbiB0aGUgZXJyb3IuXG4gKiBAcmV0dXJucyBOZXZlciByZXR1cm5zLCBhbHdheXMgdGhyb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5yZWFjaGFibGUobXNnPzogc3RyaW5nKTogbmV2ZXIge1xuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihgVW5yZWFjaGFibGUke21zZ1N1ZmZpeH1gKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsY0FBYyxRQUFRLHVCQUF1QjtBQUV0RDs7Ozs7Ozs7Ozs7O0NBWUMsR0FDRCxPQUFPLFNBQVMsWUFBWSxHQUFZO0VBQ3RDLE1BQU0sWUFBWSxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHO0VBQ3JDLE1BQU0sSUFBSSxlQUFlLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztBQUNwRCJ9
// denoCacheMetadata=16760473615500595700,5020167707224628826