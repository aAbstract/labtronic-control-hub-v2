// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` match RegExp `expected`. If not
 * then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertMatch } from "@std/assert";
 *
 * assertMatch("Raptor", /Raptor/); // Doesn't throw
 * assertMatch("Denosaurus", /Raptor/); // Throws
 * ```
 *
 * @param actual The actual value to be matched.
 * @param expected The expected pattern to match.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertMatch(actual, expected, msg) {
  if (expected.test(actual)) return;
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${actual}" to match: "${expected}"${msgSuffix}`;
  throw new AssertionError(msg);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L21hdGNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gXCIuL2Fzc2VydGlvbl9lcnJvci50c1wiO1xuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgbWF0Y2ggUmVnRXhwIGBleHBlY3RlZGAuIElmIG5vdFxuICogdGhlbiB0aHJvdy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgaWdub3JlXG4gKiBpbXBvcnQgeyBhc3NlcnRNYXRjaCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydE1hdGNoKFwiUmFwdG9yXCIsIC9SYXB0b3IvKTsgLy8gRG9lc24ndCB0aHJvd1xuICogYXNzZXJ0TWF0Y2goXCJEZW5vc2F1cnVzXCIsIC9SYXB0b3IvKTsgLy8gVGhyb3dzXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gYWN0dWFsIFRoZSBhY3R1YWwgdmFsdWUgdG8gYmUgbWF0Y2hlZC5cbiAqIEBwYXJhbSBleHBlY3RlZCBUaGUgZXhwZWN0ZWQgcGF0dGVybiB0byBtYXRjaC5cbiAqIEBwYXJhbSBtc2cgVGhlIG9wdGlvbmFsIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGUgYXNzZXJ0aW9uIGZhaWxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TWF0Y2goXG4gIGFjdHVhbDogc3RyaW5nLFxuICBleHBlY3RlZDogUmVnRXhwLFxuICBtc2c/OiBzdHJpbmcsXG4pIHtcbiAgaWYgKGV4cGVjdGVkLnRlc3QoYWN0dWFsKSkgcmV0dXJuO1xuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIG1zZyA9IGBFeHBlY3RlZCBhY3R1YWw6IFwiJHthY3R1YWx9XCIgdG8gbWF0Y2g6IFwiJHtleHBlY3RlZH1cIiR7bXNnU3VmZml4fWA7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBUyxZQUNkLE1BQWMsRUFDZCxRQUFnQixFQUNoQixHQUFZO0VBRVosSUFBSSxTQUFTLElBQUksQ0FBQyxTQUFTO0VBQzNCLE1BQU0sWUFBWSxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHO0VBQ3JDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLGFBQWEsRUFBRSxTQUFTLENBQUMsRUFBRSxVQUFVLENBQUM7RUFDeEUsTUFBTSxJQUFJLGVBQWU7QUFDM0IifQ==
// denoCacheMetadata=5716297527294086440,17360076780722847880