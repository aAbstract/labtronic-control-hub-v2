// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { AssertionError } from "./assertion_error.ts";
/**
 * Use this to stub out methods that will throw when invoked.
 *
 * @example Usage
 * ```ts ignore
 * import { unimplemented } from "@std/assert";
 *
 * unimplemented(); // Throws
 * ```
 *
 * @param msg Optional message to include in the error.
 * @returns Never returns, always throws.
 */ export function unimplemented(msg) {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Unimplemented${msgSuffix}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L3VuaW1wbGVtZW50ZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cbmltcG9ydCB7IEFzc2VydGlvbkVycm9yIH0gZnJvbSBcIi4vYXNzZXJ0aW9uX2Vycm9yLnRzXCI7XG5cbi8qKlxuICogVXNlIHRoaXMgdG8gc3R1YiBvdXQgbWV0aG9kcyB0aGF0IHdpbGwgdGhyb3cgd2hlbiBpbnZva2VkLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0cyBpZ25vcmVcbiAqIGltcG9ydCB7IHVuaW1wbGVtZW50ZWQgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiB1bmltcGxlbWVudGVkKCk7IC8vIFRocm93c1xuICogYGBgXG4gKlxuICogQHBhcmFtIG1zZyBPcHRpb25hbCBtZXNzYWdlIHRvIGluY2x1ZGUgaW4gdGhlIGVycm9yLlxuICogQHJldHVybnMgTmV2ZXIgcmV0dXJucywgYWx3YXlzIHRocm93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaW1wbGVtZW50ZWQobXNnPzogc3RyaW5nKTogbmV2ZXIge1xuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihgVW5pbXBsZW1lbnRlZCR7bXNnU3VmZml4fWApO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxjQUFjLFFBQVEsdUJBQXVCO0FBRXREOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxjQUFjLEdBQVk7RUFDeEMsTUFBTSxZQUFZLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUc7RUFDckMsTUFBTSxJQUFJLGVBQWUsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDO0FBQ3REIn0=
// denoCacheMetadata=8026050746595807956,10130163370089491123