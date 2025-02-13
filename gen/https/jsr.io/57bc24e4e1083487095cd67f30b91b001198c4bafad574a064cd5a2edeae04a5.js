// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { equal } from "./equal.ts";
import { format } from "jsr:@std/internal@^1.0.4/format";
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` includes the `expected` values. If not then
 * an error will be thrown.
 *
 * Type parameter can be specified to ensure values under comparison have the
 * same type.
 *
 * @example Usage
 * ```ts ignore
 * import { assertArrayIncludes } from "@std/assert";
 *
 * assertArrayIncludes([1, 2], [2]); // Doesn't throw
 * assertArrayIncludes([1, 2], [3]); // Throws
 * ```
 *
 * @typeParam T The type of the elements in the array to compare.
 * @param actual The array-like object to check for.
 * @param expected The array-like object to check for.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertArrayIncludes(actual, expected, msg) {
  const missing = [];
  for(let i = 0; i < expected.length; i++){
    let found = false;
    for(let j = 0; j < actual.length; j++){
      if (equal(expected[i], actual[j])) {
        found = true;
        break;
      }
    }
    if (!found) {
      missing.push(expected[i]);
    }
  }
  if (missing.length === 0) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${format(actual)}" to include: "${format(expected)}"${msgSuffix}\nmissing: ${format(missing)}`;
  throw new AssertionError(msg);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2FycmF5X2luY2x1ZGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5pbXBvcnQgeyBlcXVhbCB9IGZyb20gXCIuL2VxdWFsLnRzXCI7XG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tIFwianNyOkBzdGQvaW50ZXJuYWxAXjEuMC40L2Zvcm1hdFwiO1xuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqIEFuIGFycmF5LWxpa2Ugb2JqZWN0IChgQXJyYXlgLCBgVWludDhBcnJheWAsIGBOb2RlTGlzdGAsIGV0Yy4pIHRoYXQgaXMgbm90IGEgc3RyaW5nICovXG5leHBvcnQgdHlwZSBBcnJheUxpa2VBcmc8VD4gPSBBcnJheUxpa2U8VD4gJiBvYmplY3Q7XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBpbmNsdWRlcyB0aGUgYGV4cGVjdGVkYCB2YWx1ZXMuIElmIG5vdCB0aGVuXG4gKiBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAqXG4gKiBUeXBlIHBhcmFtZXRlciBjYW4gYmUgc3BlY2lmaWVkIHRvIGVuc3VyZSB2YWx1ZXMgdW5kZXIgY29tcGFyaXNvbiBoYXZlIHRoZVxuICogc2FtZSB0eXBlLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGFzc2VydEFycmF5SW5jbHVkZXMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRBcnJheUluY2x1ZGVzKFsxLCAyXSwgWzJdKTsgLy8gRG9lc24ndCB0aHJvd1xuICogYXNzZXJ0QXJyYXlJbmNsdWRlcyhbMSwgMl0sIFszXSk7IC8vIFRocm93c1xuICogYGBgXG4gKlxuICogQHR5cGVQYXJhbSBUIFRoZSB0eXBlIG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgYXJyYXkgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSBhY3R1YWwgVGhlIGFycmF5LWxpa2Ugb2JqZWN0IHRvIGNoZWNrIGZvci5cbiAqIEBwYXJhbSBleHBlY3RlZCBUaGUgYXJyYXktbGlrZSBvYmplY3QgdG8gY2hlY2sgZm9yLlxuICogQHBhcmFtIG1zZyBUaGUgb3B0aW9uYWwgbWVzc2FnZSB0byBkaXNwbGF5IGlmIHRoZSBhc3NlcnRpb24gZmFpbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRBcnJheUluY2x1ZGVzPFQ+KFxuICBhY3R1YWw6IEFycmF5TGlrZUFyZzxUPixcbiAgZXhwZWN0ZWQ6IEFycmF5TGlrZUFyZzxUPixcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIGNvbnN0IG1pc3Npbmc6IHVua25vd25bXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBhY3R1YWwubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChlcXVhbChleHBlY3RlZFtpXSwgYWN0dWFsW2pdKSkge1xuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICBtaXNzaW5nLnB1c2goZXhwZWN0ZWRbaV0pO1xuICAgIH1cbiAgfVxuICBpZiAobWlzc2luZy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIG1zZyA9IGBFeHBlY3RlZCBhY3R1YWw6IFwiJHtmb3JtYXQoYWN0dWFsKX1cIiB0byBpbmNsdWRlOiBcIiR7XG4gICAgZm9ybWF0KGV4cGVjdGVkKVxuICB9XCIke21zZ1N1ZmZpeH1cXG5taXNzaW5nOiAke2Zvcm1hdChtaXNzaW5nKX1gO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBQ3JDLFNBQVMsS0FBSyxRQUFRLGFBQWE7QUFDbkMsU0FBUyxNQUFNLFFBQVEsa0NBQWtDO0FBQ3pELFNBQVMsY0FBYyxRQUFRLHVCQUF1QjtBQUt0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUNELE9BQU8sU0FBUyxvQkFDZCxNQUF1QixFQUN2QixRQUF5QixFQUN6QixHQUFZO0VBRVosTUFBTSxVQUFxQixFQUFFO0VBQzdCLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxTQUFTLE1BQU0sRUFBRSxJQUFLO0lBQ3hDLElBQUksUUFBUTtJQUNaLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxPQUFPLE1BQU0sRUFBRSxJQUFLO01BQ3RDLElBQUksTUFBTSxRQUFRLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEdBQUc7UUFDakMsUUFBUTtRQUNSO01BQ0Y7SUFDRjtJQUNBLElBQUksQ0FBQyxPQUFPO01BQ1YsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDMUI7RUFDRjtFQUNBLElBQUksUUFBUSxNQUFNLEtBQUssR0FBRztJQUN4QjtFQUNGO0VBRUEsTUFBTSxZQUFZLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUc7RUFDckMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sUUFBUSxlQUFlLEVBQ3ZELE9BQU8sVUFDUixDQUFDLEVBQUUsVUFBVSxXQUFXLEVBQUUsT0FBTyxTQUFTLENBQUM7RUFDNUMsTUFBTSxJQUFJLGVBQWU7QUFDM0IifQ==
// denoCacheMetadata=178362161409377516,3049493843025929468