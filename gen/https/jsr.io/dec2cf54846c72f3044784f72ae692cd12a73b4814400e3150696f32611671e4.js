// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** A library of assertion functions.
 * If the assertion is false an `AssertionError` will be thrown which will
 * result in pretty-printed diff of failing assertion.
 *
 * This module is browser compatible, but do not rely on good formatting of
 * values for AssertionError messages in browsers.
 *
 * ```ts ignore
 * import { assert } from "@std/assert";
 *
 * assert("I am truthy"); // Doesn't throw
 * assert(false); // Throws `AssertionError`
 * ```
 *
 * @module
 */ export * from "./almost_equals.ts";
export * from "./array_includes.ts";
export * from "./equals.ts";
export * from "./exists.ts";
export * from "./false.ts";
export * from "./greater_or_equal.ts";
export * from "./greater.ts";
export * from "./instance_of.ts";
export * from "./is_error.ts";
export * from "./less_or_equal.ts";
export * from "./less.ts";
export * from "./match.ts";
export * from "./not_equals.ts";
export * from "./not_instance_of.ts";
export * from "./not_match.ts";
export * from "./not_strict_equals.ts";
export * from "./object_match.ts";
export * from "./rejects.ts";
export * from "./strict_equals.ts";
export * from "./string_includes.ts";
export * from "./throws.ts";
export * from "./assert.ts";
export * from "./assertion_error.ts";
export * from "./equal.ts";
export * from "./fail.ts";
export * from "./unimplemented.ts";
export * from "./unreachable.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKiogQSBsaWJyYXJ5IG9mIGFzc2VydGlvbiBmdW5jdGlvbnMuXG4gKiBJZiB0aGUgYXNzZXJ0aW9uIGlzIGZhbHNlIGFuIGBBc3NlcnRpb25FcnJvcmAgd2lsbCBiZSB0aHJvd24gd2hpY2ggd2lsbFxuICogcmVzdWx0IGluIHByZXR0eS1wcmludGVkIGRpZmYgb2YgZmFpbGluZyBhc3NlcnRpb24uXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLCBidXQgZG8gbm90IHJlbHkgb24gZ29vZCBmb3JtYXR0aW5nIG9mXG4gKiB2YWx1ZXMgZm9yIEFzc2VydGlvbkVycm9yIG1lc3NhZ2VzIGluIGJyb3dzZXJzLlxuICpcbiAqIGBgYHRzIGlnbm9yZVxuICogaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0KFwiSSBhbSB0cnV0aHlcIik7IC8vIERvZXNuJ3QgdGhyb3dcbiAqIGFzc2VydChmYWxzZSk7IC8vIFRocm93cyBgQXNzZXJ0aW9uRXJyb3JgXG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0ICogZnJvbSBcIi4vYWxtb3N0X2VxdWFscy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vYXJyYXlfaW5jbHVkZXMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2VxdWFscy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZXhpc3RzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9mYWxzZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZ3JlYXRlcl9vcl9lcXVhbC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZ3JlYXRlci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaW5zdGFuY2Vfb2YudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2lzX2Vycm9yLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9sZXNzX29yX2VxdWFsLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9sZXNzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9tYXRjaC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbm90X2VxdWFscy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbm90X2luc3RhbmNlX29mLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ub3RfbWF0Y2gudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL25vdF9zdHJpY3RfZXF1YWxzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9vYmplY3RfbWF0Y2gudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3JlamVjdHMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3N0cmljdF9lcXVhbHMudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3N0cmluZ19pbmNsdWRlcy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdGhyb3dzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9hc3NlcnQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Fzc2VydGlvbl9lcnJvci50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vZXF1YWwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2ZhaWwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3VuaW1wbGVtZW50ZWQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3VucmVhY2hhYmxlLnRzXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FFRCxjQUFjLHFCQUFxQjtBQUNuQyxjQUFjLHNCQUFzQjtBQUNwQyxjQUFjLGNBQWM7QUFDNUIsY0FBYyxjQUFjO0FBQzVCLGNBQWMsYUFBYTtBQUMzQixjQUFjLHdCQUF3QjtBQUN0QyxjQUFjLGVBQWU7QUFDN0IsY0FBYyxtQkFBbUI7QUFDakMsY0FBYyxnQkFBZ0I7QUFDOUIsY0FBYyxxQkFBcUI7QUFDbkMsY0FBYyxZQUFZO0FBQzFCLGNBQWMsYUFBYTtBQUMzQixjQUFjLGtCQUFrQjtBQUNoQyxjQUFjLHVCQUF1QjtBQUNyQyxjQUFjLGlCQUFpQjtBQUMvQixjQUFjLHlCQUF5QjtBQUN2QyxjQUFjLG9CQUFvQjtBQUNsQyxjQUFjLGVBQWU7QUFDN0IsY0FBYyxxQkFBcUI7QUFDbkMsY0FBYyx1QkFBdUI7QUFDckMsY0FBYyxjQUFjO0FBQzVCLGNBQWMsY0FBYztBQUM1QixjQUFjLHVCQUF1QjtBQUNyQyxjQUFjLGFBQWE7QUFDM0IsY0FBYyxZQUFZO0FBQzFCLGNBQWMscUJBQXFCO0FBQ25DLGNBQWMsbUJBQW1CIn0=
// denoCacheMetadata=13027553989984143260,11926893222197028747