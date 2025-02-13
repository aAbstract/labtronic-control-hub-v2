// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Forcefully throws a failed assertion.
 *
 * @example Usage
 * ```ts ignore
 * import { fail } from "@std/assert";
 *
 * fail("Deliberately failed!"); // Throws
 * ```
 *
 * @param msg Optional message to include in the error.
 * @returns Never returns, always throws.
 */ export function fail(msg) {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Failed assertion${msgSuffix}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L2ZhaWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IEFzc2VydGlvbkVycm9yIH0gZnJvbSBcIi4vYXNzZXJ0aW9uX2Vycm9yLnRzXCI7XG5cbi8qKlxuICogRm9yY2VmdWxseSB0aHJvd3MgYSBmYWlsZWQgYXNzZXJ0aW9uLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IGZhaWwgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBmYWlsKFwiRGVsaWJlcmF0ZWx5IGZhaWxlZCFcIik7IC8vIFRocm93c1xuICogYGBgXG4gKlxuICogQHBhcmFtIG1zZyBPcHRpb25hbCBtZXNzYWdlIHRvIGluY2x1ZGUgaW4gdGhlIGVycm9yLlxuICogQHJldHVybnMgTmV2ZXIgcmV0dXJucywgYWx3YXlzIHRocm93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZhaWwobXNnPzogc3RyaW5nKTogbmV2ZXIge1xuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihgRmFpbGVkIGFzc2VydGlvbiR7bXNnU3VmZml4fWApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBRXREOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQVk7RUFDL0IsTUFBTSxZQUFZLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUc7RUFDckMsTUFBTSxJQUFJLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUM7QUFDekQifQ==
// denoCacheMetadata=14452894800486853979,1242747089866398449