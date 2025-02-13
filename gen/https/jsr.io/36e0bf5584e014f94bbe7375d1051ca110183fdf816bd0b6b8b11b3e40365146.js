// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` and `expected` are almost equal numbers
 * through a given tolerance. It can be used to take into account IEEE-754
 * double-precision floating-point representation limitations. If the values
 * are not almost equal then throw.
 *
 * The default tolerance is one hundred thousandth of a percent of the
 * expected value.
 *
 * @example Usage
 * ```ts ignore
 * import { assertAlmostEquals } from "@std/assert";
 *
 * assertAlmostEquals(0.01, 0.02); // Throws
 * assertAlmostEquals(1e-8, 1e-9); // Throws
 * assertAlmostEquals(1.000000001e-8, 1.000000002e-8); // Doesn't throw
 * assertAlmostEquals(0.01, 0.02, 0.1); // Doesn't throw
 * assertAlmostEquals(0.1 + 0.2, 0.3, 1e-16); // Doesn't throw
 * assertAlmostEquals(0.1 + 0.2, 0.3, 1e-17); // Throws
 * ```
 *
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param tolerance The tolerance to consider the values almost equal. The
 * default is one hundred thousandth of a percent of the expected value.
 * @param msg The optional message to include in the error.
 */ export function assertAlmostEquals(actual, expected, tolerance, msg) {
  if (Object.is(actual, expected)) {
    return;
  }
  const delta = Math.abs(expected - actual);
  if (tolerance === undefined) {
    tolerance = isFinite(expected) ? Math.abs(expected * 1e-7) : 1e-7;
  }
  if (delta <= tolerance) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  const f = (n)=>Number.isInteger(n) ? n : n.toExponential();
  throw new AssertionError(`Expected actual: "${f(actual)}" to be close to "${f(expected)}": \
delta "${f(delta)}" is greater than "${f(tolerance)}"${msgSuffix}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2FsbW9zdF9lcXVhbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IEFzc2VydGlvbkVycm9yIH0gZnJvbSBcIi4vYXNzZXJ0aW9uX2Vycm9yLnRzXCI7XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYCBhcmUgYWxtb3N0IGVxdWFsIG51bWJlcnNcbiAqIHRocm91Z2ggYSBnaXZlbiB0b2xlcmFuY2UuIEl0IGNhbiBiZSB1c2VkIHRvIHRha2UgaW50byBhY2NvdW50IElFRUUtNzU0XG4gKiBkb3VibGUtcHJlY2lzaW9uIGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIGxpbWl0YXRpb25zLiBJZiB0aGUgdmFsdWVzXG4gKiBhcmUgbm90IGFsbW9zdCBlcXVhbCB0aGVuIHRocm93LlxuICpcbiAqIFRoZSBkZWZhdWx0IHRvbGVyYW5jZSBpcyBvbmUgaHVuZHJlZCB0aG91c2FuZHRoIG9mIGEgcGVyY2VudCBvZiB0aGVcbiAqIGV4cGVjdGVkIHZhbHVlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGFzc2VydEFsbW9zdEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEFsbW9zdEVxdWFscygwLjAxLCAwLjAyKTsgLy8gVGhyb3dzXG4gKiBhc3NlcnRBbG1vc3RFcXVhbHMoMWUtOCwgMWUtOSk7IC8vIFRocm93c1xuICogYXNzZXJ0QWxtb3N0RXF1YWxzKDEuMDAwMDAwMDAxZS04LCAxLjAwMDAwMDAwMmUtOCk7IC8vIERvZXNuJ3QgdGhyb3dcbiAqIGFzc2VydEFsbW9zdEVxdWFscygwLjAxLCAwLjAyLCAwLjEpOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnRBbG1vc3RFcXVhbHMoMC4xICsgMC4yLCAwLjMsIDFlLTE2KTsgLy8gRG9lc24ndCB0aHJvd1xuICogYXNzZXJ0QWxtb3N0RXF1YWxzKDAuMSArIDAuMiwgMC4zLCAxZS0xNyk7IC8vIFRocm93c1xuICogYGBgXG4gKlxuICogQHBhcmFtIGFjdHVhbCBUaGUgYWN0dWFsIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gZXhwZWN0ZWQgVGhlIGV4cGVjdGVkIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gdG9sZXJhbmNlIFRoZSB0b2xlcmFuY2UgdG8gY29uc2lkZXIgdGhlIHZhbHVlcyBhbG1vc3QgZXF1YWwuIFRoZVxuICogZGVmYXVsdCBpcyBvbmUgaHVuZHJlZCB0aG91c2FuZHRoIG9mIGEgcGVyY2VudCBvZiB0aGUgZXhwZWN0ZWQgdmFsdWUuXG4gKiBAcGFyYW0gbXNnIFRoZSBvcHRpb25hbCBtZXNzYWdlIHRvIGluY2x1ZGUgaW4gdGhlIGVycm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0QWxtb3N0RXF1YWxzKFxuICBhY3R1YWw6IG51bWJlcixcbiAgZXhwZWN0ZWQ6IG51bWJlcixcbiAgdG9sZXJhbmNlPzogbnVtYmVyLFxuICBtc2c/OiBzdHJpbmcsXG4pIHtcbiAgaWYgKE9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBkZWx0YSA9IE1hdGguYWJzKGV4cGVjdGVkIC0gYWN0dWFsKTtcbiAgaWYgKHRvbGVyYW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdG9sZXJhbmNlID0gaXNGaW5pdGUoZXhwZWN0ZWQpID8gTWF0aC5hYnMoZXhwZWN0ZWQgKiAxZS03KSA6IDFlLTc7XG4gIH1cbiAgaWYgKGRlbHRhIDw9IHRvbGVyYW5jZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgY29uc3QgZiA9IChuOiBudW1iZXIpID0+IE51bWJlci5pc0ludGVnZXIobikgPyBuIDogbi50b0V4cG9uZW50aWFsKCk7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihcbiAgICBgRXhwZWN0ZWQgYWN0dWFsOiBcIiR7ZihhY3R1YWwpfVwiIHRvIGJlIGNsb3NlIHRvIFwiJHtmKGV4cGVjdGVkKX1cIjogXFxcbmRlbHRhIFwiJHtmKGRlbHRhKX1cIiBpcyBncmVhdGVyIHRoYW4gXCIke2YodG9sZXJhbmNlKX1cIiR7bXNnU3VmZml4fWAsXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLGNBQWMsUUFBUSx1QkFBdUI7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMEJDLEdBQ0QsT0FBTyxTQUFTLG1CQUNkLE1BQWMsRUFDZCxRQUFnQixFQUNoQixTQUFrQixFQUNsQixHQUFZO0VBRVosSUFBSSxPQUFPLEVBQUUsQ0FBQyxRQUFRLFdBQVc7SUFDL0I7RUFDRjtFQUNBLE1BQU0sUUFBUSxLQUFLLEdBQUcsQ0FBQyxXQUFXO0VBQ2xDLElBQUksY0FBYyxXQUFXO0lBQzNCLFlBQVksU0FBUyxZQUFZLEtBQUssR0FBRyxDQUFDLFdBQVcsUUFBUTtFQUMvRDtFQUNBLElBQUksU0FBUyxXQUFXO0lBQ3RCO0VBQ0Y7RUFFQSxNQUFNLFlBQVksTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRztFQUNyQyxNQUFNLElBQUksQ0FBQyxJQUFjLE9BQU8sU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFLGFBQWE7RUFDbEUsTUFBTSxJQUFJLGVBQ1IsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLFFBQVEsa0JBQWtCLEVBQUUsRUFBRSxVQUFVO09BQzVELEVBQUUsRUFBRSxPQUFPLG1CQUFtQixFQUFFLEVBQUUsV0FBVyxDQUFDLEVBQUUsVUFBVSxDQUFDO0FBRWxFIn0=
// denoCacheMetadata=14810722895309316020,10254368915523161306