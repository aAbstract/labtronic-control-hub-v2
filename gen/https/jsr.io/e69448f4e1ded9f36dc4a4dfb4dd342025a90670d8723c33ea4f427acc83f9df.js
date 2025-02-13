// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { buildMessage } from "jsr:@std/internal@^1.0.4/build-message";
import { diff } from "jsr:@std/internal@^1.0.4/diff";
import { diffStr } from "jsr:@std/internal@^1.0.4/diff-str";
import { format } from "jsr:@std/internal@^1.0.4/format";
import { red } from "jsr:@std/internal@^1.0.4/styles";
import { AssertionError } from "./assertion_error.ts";
/**
 * Make an assertion that `actual` and `expected` are strictly equal, using
 * {@linkcode Object.is} for equality comparison. If not, then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertStrictEquals } from "@std/assert";
 *
 * const a = {};
 * const b = a;
 * assertStrictEquals(a, b); // Doesn't throw
 *
 * const c = {};
 * const d = {};
 * assertStrictEquals(c, d); // Throws
 * ```
 *
 * @typeParam T The type of the expected value.
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertStrictEquals(actual, expected, msg) {
  if (Object.is(actual, expected)) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  let message;
  const actualString = format(actual);
  const expectedString = format(expected);
  if (actualString === expectedString) {
    const withOffset = actualString.split("\n").map((l)=>`    ${l}`).join("\n");
    message = `Values have the same structure but are not reference-equal${msgSuffix}\n\n${red(withOffset)}\n`;
  } else {
    const stringDiff = typeof actual === "string" && typeof expected === "string";
    const diffResult = stringDiff ? diffStr(actual, expected) : diff(actualString.split("\n"), expectedString.split("\n"));
    const diffMsg = buildMessage(diffResult, {
      stringDiff
    }).join("\n");
    message = `Values are not strictly equal${msgSuffix}\n${diffMsg}`;
  }
  throw new AssertionError(message);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L3N0cmljdF9lcXVhbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IGJ1aWxkTWVzc2FnZSB9IGZyb20gXCJqc3I6QHN0ZC9pbnRlcm5hbEBeMS4wLjQvYnVpbGQtbWVzc2FnZVwiO1xuaW1wb3J0IHsgZGlmZiB9IGZyb20gXCJqc3I6QHN0ZC9pbnRlcm5hbEBeMS4wLjQvZGlmZlwiO1xuaW1wb3J0IHsgZGlmZlN0ciB9IGZyb20gXCJqc3I6QHN0ZC9pbnRlcm5hbEBeMS4wLjQvZGlmZi1zdHJcIjtcbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCJqc3I6QHN0ZC9pbnRlcm5hbEBeMS4wLjQvZm9ybWF0XCI7XG5pbXBvcnQgeyByZWQgfSBmcm9tIFwianNyOkBzdGQvaW50ZXJuYWxAXjEuMC40L3N0eWxlc1wiO1xuaW1wb3J0IHsgQXNzZXJ0aW9uRXJyb3IgfSBmcm9tIFwiLi9hc3NlcnRpb25fZXJyb3IudHNcIjtcblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIGFyZSBzdHJpY3RseSBlcXVhbCwgdXNpbmdcbiAqIHtAbGlua2NvZGUgT2JqZWN0LmlzfSBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbi4gSWYgbm90LCB0aGVuIHRocm93LlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGFzc2VydFN0cmljdEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGNvbnN0IGEgPSB7fTtcbiAqIGNvbnN0IGIgPSBhO1xuICogYXNzZXJ0U3RyaWN0RXF1YWxzKGEsIGIpOyAvLyBEb2Vzbid0IHRocm93XG4gKlxuICogY29uc3QgYyA9IHt9O1xuICogY29uc3QgZCA9IHt9O1xuICogYXNzZXJ0U3RyaWN0RXF1YWxzKGMsIGQpOyAvLyBUaHJvd3NcbiAqIGBgYFxuICpcbiAqIEB0eXBlUGFyYW0gVCBUaGUgdHlwZSBvZiB0aGUgZXhwZWN0ZWQgdmFsdWUuXG4gKiBAcGFyYW0gYWN0dWFsIFRoZSBhY3R1YWwgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSBleHBlY3RlZCBUaGUgZXhwZWN0ZWQgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSBtc2cgVGhlIG9wdGlvbmFsIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGUgYXNzZXJ0aW9uIGZhaWxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0U3RyaWN0RXF1YWxzPFQ+KFxuICBhY3R1YWw6IHVua25vd24sXG4gIGV4cGVjdGVkOiBULFxuICBtc2c/OiBzdHJpbmcsXG4pOiBhc3NlcnRzIGFjdHVhbCBpcyBUIHtcbiAgaWYgKE9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgbGV0IG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdCBhY3R1YWxTdHJpbmcgPSBmb3JtYXQoYWN0dWFsKTtcbiAgY29uc3QgZXhwZWN0ZWRTdHJpbmcgPSBmb3JtYXQoZXhwZWN0ZWQpO1xuXG4gIGlmIChhY3R1YWxTdHJpbmcgPT09IGV4cGVjdGVkU3RyaW5nKSB7XG4gICAgY29uc3Qgd2l0aE9mZnNldCA9IGFjdHVhbFN0cmluZ1xuICAgICAgLnNwbGl0KFwiXFxuXCIpXG4gICAgICAubWFwKChsKSA9PiBgICAgICR7bH1gKVxuICAgICAgLmpvaW4oXCJcXG5cIik7XG4gICAgbWVzc2FnZSA9XG4gICAgICBgVmFsdWVzIGhhdmUgdGhlIHNhbWUgc3RydWN0dXJlIGJ1dCBhcmUgbm90IHJlZmVyZW5jZS1lcXVhbCR7bXNnU3VmZml4fVxcblxcbiR7XG4gICAgICAgIHJlZCh3aXRoT2Zmc2V0KVxuICAgICAgfVxcbmA7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc3RyaW5nRGlmZiA9ICh0eXBlb2YgYWN0dWFsID09PSBcInN0cmluZ1wiKSAmJlxuICAgICAgKHR5cGVvZiBleHBlY3RlZCA9PT0gXCJzdHJpbmdcIik7XG4gICAgY29uc3QgZGlmZlJlc3VsdCA9IHN0cmluZ0RpZmZcbiAgICAgID8gZGlmZlN0cihhY3R1YWwgYXMgc3RyaW5nLCBleHBlY3RlZCBhcyBzdHJpbmcpXG4gICAgICA6IGRpZmYoYWN0dWFsU3RyaW5nLnNwbGl0KFwiXFxuXCIpLCBleHBlY3RlZFN0cmluZy5zcGxpdChcIlxcblwiKSk7XG4gICAgY29uc3QgZGlmZk1zZyA9IGJ1aWxkTWVzc2FnZShkaWZmUmVzdWx0LCB7IHN0cmluZ0RpZmYgfSkuam9pbihcIlxcblwiKTtcbiAgICBtZXNzYWdlID0gYFZhbHVlcyBhcmUgbm90IHN0cmljdGx5IGVxdWFsJHttc2dTdWZmaXh9XFxuJHtkaWZmTXNnfWA7XG4gIH1cblxuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobWVzc2FnZSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUNyQyxTQUFTLFlBQVksUUFBUSx5Q0FBeUM7QUFDdEUsU0FBUyxJQUFJLFFBQVEsZ0NBQWdDO0FBQ3JELFNBQVMsT0FBTyxRQUFRLG9DQUFvQztBQUM1RCxTQUFTLE1BQU0sUUFBUSxrQ0FBa0M7QUFDekQsU0FBUyxHQUFHLFFBQVEsa0NBQWtDO0FBQ3RELFNBQVMsY0FBYyxRQUFRLHVCQUF1QjtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsT0FBTyxTQUFTLG1CQUNkLE1BQWUsRUFDZixRQUFXLEVBQ1gsR0FBWTtFQUVaLElBQUksT0FBTyxFQUFFLENBQUMsUUFBUSxXQUFXO0lBQy9CO0VBQ0Y7RUFFQSxNQUFNLFlBQVksTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRztFQUNyQyxJQUFJO0VBRUosTUFBTSxlQUFlLE9BQU87RUFDNUIsTUFBTSxpQkFBaUIsT0FBTztFQUU5QixJQUFJLGlCQUFpQixnQkFBZ0I7SUFDbkMsTUFBTSxhQUFhLGFBQ2hCLEtBQUssQ0FBQyxNQUNOLEdBQUcsQ0FBQyxDQUFDLElBQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQ3JCLElBQUksQ0FBQztJQUNSLFVBQ0UsQ0FBQywwREFBMEQsRUFBRSxVQUFVLElBQUksRUFDekUsSUFBSSxZQUNMLEVBQUUsQ0FBQztFQUNSLE9BQU87SUFDTCxNQUFNLGFBQWEsQUFBQyxPQUFPLFdBQVcsWUFDbkMsT0FBTyxhQUFhO0lBQ3ZCLE1BQU0sYUFBYSxhQUNmLFFBQVEsUUFBa0IsWUFDMUIsS0FBSyxhQUFhLEtBQUssQ0FBQyxPQUFPLGVBQWUsS0FBSyxDQUFDO0lBQ3hELE1BQU0sVUFBVSxhQUFhLFlBQVk7TUFBRTtJQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzlELFVBQVUsQ0FBQyw2QkFBNkIsRUFBRSxVQUFVLEVBQUUsRUFBRSxRQUFRLENBQUM7RUFDbkU7RUFFQSxNQUFNLElBQUksZUFBZTtBQUMzQiJ9
// denoCacheMetadata=537652245493997485,11405839412779677119