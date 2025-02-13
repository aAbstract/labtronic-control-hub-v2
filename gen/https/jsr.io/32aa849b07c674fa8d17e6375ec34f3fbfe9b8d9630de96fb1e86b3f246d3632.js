// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Error thrown when an assertion fails.
 *
 * @example Usage
 * ```ts ignore
 * import { AssertionError } from "@std/assert";
 *
 * try {
 *   throw new AssertionError("foo", { cause: "bar" });
 * } catch (error) {
 *   if (error instanceof AssertionError) {
 *     error.message === "foo"; // true
 *     error.cause === "bar"; // true
 *   }
 * }
 * ```
 */ export class AssertionError extends Error {
  /** Constructs a new instance.
   *
   * @param message The error message.
   * @param options Additional options. This argument is still unstable. It may change in the future release.
   */ constructor(message, options){
    super(message, options);
    this.name = "AssertionError";
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2Fzc2VydGlvbl9lcnJvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIEVycm9yIHRocm93biB3aGVuIGFuIGFzc2VydGlvbiBmYWlscy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgaWdub3JlXG4gKiBpbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIHRyeSB7XG4gKiAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihcImZvb1wiLCB7IGNhdXNlOiBcImJhclwiIH0pO1xuICogfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgaWYgKGVycm9yIGluc3RhbmNlb2YgQXNzZXJ0aW9uRXJyb3IpIHtcbiAqICAgICBlcnJvci5tZXNzYWdlID09PSBcImZvb1wiOyAvLyB0cnVlXG4gKiAgICAgZXJyb3IuY2F1c2UgPT09IFwiYmFyXCI7IC8vIHRydWVcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3NlcnRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBBZGRpdGlvbmFsIG9wdGlvbnMuIFRoaXMgYXJndW1lbnQgaXMgc3RpbGwgdW5zdGFibGUuIEl0IG1heSBjaGFuZ2UgaW4gdGhlIGZ1dHVyZSByZWxlYXNlLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogRXJyb3JPcHRpb25zKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgdGhpcy5uYW1lID0gXCJBc3NlcnRpb25FcnJvclwiO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUNELE9BQU8sTUFBTSx1QkFBdUI7RUFDbEM7Ozs7R0FJQyxHQUNELFlBQVksT0FBZSxFQUFFLE9BQXNCLENBQUU7SUFDbkQsS0FBSyxDQUFDLFNBQVM7SUFDZixJQUFJLENBQUMsSUFBSSxHQUFHO0VBQ2Q7QUFDRiJ9
// denoCacheMetadata=6456402345170988551,5768276842065236864