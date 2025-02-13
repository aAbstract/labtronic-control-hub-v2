// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assertEquals } from "./equals.ts";
/**
 * Make an assertion that `expected` object is a subset of `actual` object,
 * deeply. If not, then throw.
 *
 * @example Usage
 * ```ts ignore
 * import { assertObjectMatch } from "@std/assert";
 *
 * assertObjectMatch({ foo: "bar" }, { foo: "bar" }); // Doesn't throw
 * assertObjectMatch({ foo: "bar" }, { foo: "baz" }); // Throws
 * assertObjectMatch({ foo: 1, bar: 2 }, { foo: 1 }); // Doesn't throw
 * assertObjectMatch({ foo: 1 }, { foo: 1, bar: 2 }); // Throws
 * ```
 *
 * @example Usage with nested objects
 * ```ts ignore
 * import { assertObjectMatch } from "@std/assert";
 *
 * assertObjectMatch({ foo: { bar: 3, baz: 4 } }, { foo: { bar: 3 } }); // Doesn't throw
 * assertObjectMatch({ foo: { bar: 3 } }, { foo: { bar: 3, baz: 4 } }); // Throws
 * ```
 *
 * @param actual The actual value to be matched.
 * @param expected The expected value to match.
 * @param msg The optional message to display if the assertion fails.
 */ export function assertObjectMatch(// deno-lint-ignore no-explicit-any
actual, expected, msg) {
  return assertEquals(// get the intersection of "actual" and "expected"
  // side effect: all the instances' constructor field is "Object" now.
  filter(actual, expected), // set (nested) instances' constructor field to be "Object" without changing expected value.
  // see https://github.com/denoland/deno_std/pull/1419
  filter(expected, expected), msg);
}
function isObject(val) {
  return typeof val === "object" && val !== null;
}
function filter(a, b) {
  const seen = new WeakMap();
  return filterObject(a, b);
  function filterObject(a, b) {
    // Prevent infinite loop with circular references with same filter
    if (seen.has(a) && seen.get(a) === b) {
      return a;
    }
    try {
      seen.set(a, b);
    } catch (err) {
      if (err instanceof TypeError) {
        throw new TypeError(`Cannot assertObjectMatch ${a === null ? null : `type ${typeof a}`}`);
      }
    }
    // Filter keys and symbols which are present in both actual and expected
    const filtered = {};
    const keysA = Reflect.ownKeys(a);
    const keysB = Reflect.ownKeys(b);
    const entries = keysA.filter((key)=>keysB.includes(key)).map((key)=>[
        key,
        a[key]
      ]);
    if (keysA.length && keysB.length && !entries.length) {
      // If both objects are not empty but don't have the same keys or symbols,
      // returns the entries in object a.
      for (const key of keysA){
        filtered[key] = a[key];
      }
      return filtered;
    }
    for (const [key, value] of entries){
      // On regexp references, keep value as it to avoid loosing pattern and flags
      if (value instanceof RegExp) {
        filtered[key] = value;
        continue;
      }
      const subset = b[key];
      // On array references, build a filtered array and filter nested objects inside
      if (Array.isArray(value) && Array.isArray(subset)) {
        filtered[key] = filterArray(value, subset);
        continue;
      }
      // On nested objects references, build a filtered object recursively
      if (isObject(value) && isObject(subset)) {
        // When both operands are maps, build a filtered map with common keys and filter nested objects inside
        if (value instanceof Map && subset instanceof Map) {
          filtered[key] = new Map([
            ...value
          ].filter(([k])=>subset.has(k)).map(([k, v])=>{
            const v2 = subset.get(k);
            if (isObject(v) && isObject(v2)) {
              return [
                k,
                filterObject(v, v2)
              ];
            }
            return [
              k,
              v
            ];
          }));
          continue;
        }
        // When both operands are set, build a filtered set with common values
        if (value instanceof Set && subset instanceof Set) {
          filtered[key] = value.intersection(subset);
          continue;
        }
        filtered[key] = filterObject(value, subset);
        continue;
      }
      filtered[key] = value;
    }
    return filtered;
  }
  function filterArray(a, b) {
    // Prevent infinite loop with circular references with same filter
    if (seen.has(a) && seen.get(a) === b) {
      return a;
    }
    seen.set(a, b);
    const filtered = [];
    const count = Math.min(a.length, b.length);
    for(let i = 0; i < count; ++i){
      const value = a[i];
      const subset = b[i];
      // On regexp references, keep value as it to avoid loosing pattern and flags
      if (value instanceof RegExp) {
        filtered.push(value);
        continue;
      }
      // On array references, build a filtered array and filter nested objects inside
      if (Array.isArray(value) && Array.isArray(subset)) {
        filtered.push(filterArray(value, subset));
        continue;
      }
      // On nested objects references, build a filtered object recursively
      if (isObject(value) && isObject(subset)) {
        // When both operands are maps, build a filtered map with common keys and filter nested objects inside
        if (value instanceof Map && subset instanceof Map) {
          const map = new Map([
            ...value
          ].filter(([k])=>subset.has(k)).map(([k, v])=>{
            const v2 = subset.get(k);
            if (isObject(v) && isObject(v2)) {
              return [
                k,
                filterObject(v, v2)
              ];
            }
            return [
              k,
              v
            ];
          }));
          filtered.push(map);
          continue;
        }
        // When both operands are set, build a filtered set with common values
        if (value instanceof Set && subset instanceof Set) {
          filtered.push(value.intersection(subset));
          continue;
        }
        filtered.push(filterObject(value, subset));
        continue;
      }
      filtered.push(value);
    }
    return filtered;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXNzZXJ0LzEuMC42L29iamVjdF9tYXRjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIi4vZXF1YWxzLnRzXCI7XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgZXhwZWN0ZWRgIG9iamVjdCBpcyBhIHN1YnNldCBvZiBgYWN0dWFsYCBvYmplY3QsXG4gKiBkZWVwbHkuIElmIG5vdCwgdGhlbiB0aHJvdy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgaWdub3JlXG4gKiBpbXBvcnQgeyBhc3NlcnRPYmplY3RNYXRjaCB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydE9iamVjdE1hdGNoKHsgZm9vOiBcImJhclwiIH0sIHsgZm9vOiBcImJhclwiIH0pOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnRPYmplY3RNYXRjaCh7IGZvbzogXCJiYXJcIiB9LCB7IGZvbzogXCJiYXpcIiB9KTsgLy8gVGhyb3dzXG4gKiBhc3NlcnRPYmplY3RNYXRjaCh7IGZvbzogMSwgYmFyOiAyIH0sIHsgZm9vOiAxIH0pOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnRPYmplY3RNYXRjaCh7IGZvbzogMSB9LCB7IGZvbzogMSwgYmFyOiAyIH0pOyAvLyBUaHJvd3NcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlIFVzYWdlIHdpdGggbmVzdGVkIG9iamVjdHNcbiAqIGBgYHRzIGlnbm9yZVxuICogaW1wb3J0IHsgYXNzZXJ0T2JqZWN0TWF0Y2ggfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRPYmplY3RNYXRjaCh7IGZvbzogeyBiYXI6IDMsIGJhejogNCB9IH0sIHsgZm9vOiB7IGJhcjogMyB9IH0pOyAvLyBEb2Vzbid0IHRocm93XG4gKiBhc3NlcnRPYmplY3RNYXRjaCh7IGZvbzogeyBiYXI6IDMgfSB9LCB7IGZvbzogeyBiYXI6IDMsIGJhejogNCB9IH0pOyAvLyBUaHJvd3NcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBhY3R1YWwgVGhlIGFjdHVhbCB2YWx1ZSB0byBiZSBtYXRjaGVkLlxuICogQHBhcmFtIGV4cGVjdGVkIFRoZSBleHBlY3RlZCB2YWx1ZSB0byBtYXRjaC5cbiAqIEBwYXJhbSBtc2cgVGhlIG9wdGlvbmFsIG1lc3NhZ2UgdG8gZGlzcGxheSBpZiB0aGUgYXNzZXJ0aW9uIGZhaWxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0T2JqZWN0TWF0Y2goXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGFjdHVhbDogUmVjb3JkPFByb3BlcnR5S2V5LCBhbnk+LFxuICBleHBlY3RlZDogUmVjb3JkPFByb3BlcnR5S2V5LCB1bmtub3duPixcbiAgbXNnPzogc3RyaW5nLFxuKTogdm9pZCB7XG4gIHJldHVybiBhc3NlcnRFcXVhbHMoXG4gICAgLy8gZ2V0IHRoZSBpbnRlcnNlY3Rpb24gb2YgXCJhY3R1YWxcIiBhbmQgXCJleHBlY3RlZFwiXG4gICAgLy8gc2lkZSBlZmZlY3Q6IGFsbCB0aGUgaW5zdGFuY2VzJyBjb25zdHJ1Y3RvciBmaWVsZCBpcyBcIk9iamVjdFwiIG5vdy5cbiAgICBmaWx0ZXIoYWN0dWFsLCBleHBlY3RlZCksXG4gICAgLy8gc2V0IChuZXN0ZWQpIGluc3RhbmNlcycgY29uc3RydWN0b3IgZmllbGQgdG8gYmUgXCJPYmplY3RcIiB3aXRob3V0IGNoYW5naW5nIGV4cGVjdGVkIHZhbHVlLlxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZGVub19zdGQvcHVsbC8xNDE5XG4gICAgZmlsdGVyKGV4cGVjdGVkLCBleHBlY3RlZCksXG4gICAgbXNnLFxuICApO1xufVxuXG50eXBlIGxvb3NlID0gUmVjb3JkPFByb3BlcnR5S2V5LCB1bmtub3duPjtcblxuZnVuY3Rpb24gaXNPYmplY3QodmFsOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIHZhbCAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gZmlsdGVyKGE6IGxvb3NlLCBiOiBsb29zZSk6IGxvb3NlIHtcbiAgY29uc3Qgc2VlbiA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiBmaWx0ZXJPYmplY3QoYSwgYik7XG5cbiAgZnVuY3Rpb24gZmlsdGVyT2JqZWN0KGE6IGxvb3NlLCBiOiBsb29zZSk6IGxvb3NlIHtcbiAgICAvLyBQcmV2ZW50IGluZmluaXRlIGxvb3Agd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHdpdGggc2FtZSBmaWx0ZXJcbiAgICBpZiAoKHNlZW4uaGFzKGEpKSAmJiAoc2Vlbi5nZXQoYSkgPT09IGIpKSB7XG4gICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgc2Vlbi5zZXQoYSwgYik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVHlwZUVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgYENhbm5vdCBhc3NlcnRPYmplY3RNYXRjaCAke2EgPT09IG51bGwgPyBudWxsIDogYHR5cGUgJHt0eXBlb2YgYX1gfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmlsdGVyIGtleXMgYW5kIHN5bWJvbHMgd2hpY2ggYXJlIHByZXNlbnQgaW4gYm90aCBhY3R1YWwgYW5kIGV4cGVjdGVkXG4gICAgY29uc3QgZmlsdGVyZWQgPSB7fSBhcyBsb29zZTtcbiAgICBjb25zdCBrZXlzQSA9IFJlZmxlY3Qub3duS2V5cyhhKTtcbiAgICBjb25zdCBrZXlzQiA9IFJlZmxlY3Qub3duS2V5cyhiKTtcbiAgICBjb25zdCBlbnRyaWVzID0ga2V5c0EuZmlsdGVyKChrZXkpID0+IGtleXNCLmluY2x1ZGVzKGtleSkpXG4gICAgICAubWFwKChrZXkpID0+IFtrZXksIGFba2V5IGFzIHN0cmluZ11dKSBhcyBBcnJheTxbc3RyaW5nLCB1bmtub3duXT47XG5cbiAgICBpZiAoa2V5c0EubGVuZ3RoICYmIGtleXNCLmxlbmd0aCAmJiAhZW50cmllcy5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGJvdGggb2JqZWN0cyBhcmUgbm90IGVtcHR5IGJ1dCBkb24ndCBoYXZlIHRoZSBzYW1lIGtleXMgb3Igc3ltYm9scyxcbiAgICAgIC8vIHJldHVybnMgdGhlIGVudHJpZXMgaW4gb2JqZWN0IGEuXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzQSkge1xuICAgICAgICBmaWx0ZXJlZFtrZXldID0gYVtrZXldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgLy8gT24gcmVnZXhwIHJlZmVyZW5jZXMsIGtlZXAgdmFsdWUgYXMgaXQgdG8gYXZvaWQgbG9vc2luZyBwYXR0ZXJuIGFuZCBmbGFnc1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgIGZpbHRlcmVkW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN1YnNldCA9IChiIGFzIGxvb3NlKVtrZXldO1xuXG4gICAgICAvLyBPbiBhcnJheSByZWZlcmVuY2VzLCBidWlsZCBhIGZpbHRlcmVkIGFycmF5IGFuZCBmaWx0ZXIgbmVzdGVkIG9iamVjdHMgaW5zaWRlXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgQXJyYXkuaXNBcnJheShzdWJzZXQpKSB7XG4gICAgICAgIGZpbHRlcmVkW2tleV0gPSBmaWx0ZXJBcnJheSh2YWx1ZSwgc3Vic2V0KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIE9uIG5lc3RlZCBvYmplY3RzIHJlZmVyZW5jZXMsIGJ1aWxkIGEgZmlsdGVyZWQgb2JqZWN0IHJlY3Vyc2l2ZWx5XG4gICAgICBpZiAoaXNPYmplY3QodmFsdWUpICYmIGlzT2JqZWN0KHN1YnNldCkpIHtcbiAgICAgICAgLy8gV2hlbiBib3RoIG9wZXJhbmRzIGFyZSBtYXBzLCBidWlsZCBhIGZpbHRlcmVkIG1hcCB3aXRoIGNvbW1vbiBrZXlzIGFuZCBmaWx0ZXIgbmVzdGVkIG9iamVjdHMgaW5zaWRlXG4gICAgICAgIGlmICgodmFsdWUgaW5zdGFuY2VvZiBNYXApICYmIChzdWJzZXQgaW5zdGFuY2VvZiBNYXApKSB7XG4gICAgICAgICAgZmlsdGVyZWRba2V5XSA9IG5ldyBNYXAoXG4gICAgICAgICAgICBbLi4udmFsdWVdLmZpbHRlcigoW2tdKSA9PiBzdWJzZXQuaGFzKGspKS5tYXAoXG4gICAgICAgICAgICAgIChbaywgdl0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MiA9IHN1YnNldC5nZXQoayk7XG4gICAgICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHYpICYmIGlzT2JqZWN0KHYyKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFtrLCBmaWx0ZXJPYmplY3QodiBhcyBsb29zZSwgdjIgYXMgbG9vc2UpXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gW2ssIHZdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2hlbiBib3RoIG9wZXJhbmRzIGFyZSBzZXQsIGJ1aWxkIGEgZmlsdGVyZWQgc2V0IHdpdGggY29tbW9uIHZhbHVlc1xuICAgICAgICBpZiAoKHZhbHVlIGluc3RhbmNlb2YgU2V0KSAmJiAoc3Vic2V0IGluc3RhbmNlb2YgU2V0KSkge1xuICAgICAgICAgIGZpbHRlcmVkW2tleV0gPSB2YWx1ZS5pbnRlcnNlY3Rpb24oc3Vic2V0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbHRlcmVkW2tleV0gPSBmaWx0ZXJPYmplY3QodmFsdWUgYXMgbG9vc2UsIHN1YnNldCBhcyBsb29zZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmaWx0ZXJlZFtrZXldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbHRlcmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsdGVyQXJyYXkoYTogdW5rbm93bltdLCBiOiB1bmtub3duW10pOiB1bmtub3duW10ge1xuICAgIC8vIFByZXZlbnQgaW5maW5pdGUgbG9vcCB3aXRoIGNpcmN1bGFyIHJlZmVyZW5jZXMgd2l0aCBzYW1lIGZpbHRlclxuICAgIGlmIChzZWVuLmhhcyhhKSAmJiAoc2Vlbi5nZXQoYSkgPT09IGIpKSB7XG4gICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBzZWVuLnNldChhLCBiKTtcblxuICAgIGNvbnN0IGZpbHRlcmVkOiB1bmtub3duW10gPSBbXTtcbiAgICBjb25zdCBjb3VudCA9IE1hdGgubWluKGEubGVuZ3RoLCBiLmxlbmd0aCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyArK2kpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gYVtpXTtcbiAgICAgIGNvbnN0IHN1YnNldCA9IGJbaV07XG5cbiAgICAgIC8vIE9uIHJlZ2V4cCByZWZlcmVuY2VzLCBrZWVwIHZhbHVlIGFzIGl0IHRvIGF2b2lkIGxvb3NpbmcgcGF0dGVybiBhbmQgZmxhZ3NcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBmaWx0ZXJlZC5wdXNoKHZhbHVlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIE9uIGFycmF5IHJlZmVyZW5jZXMsIGJ1aWxkIGEgZmlsdGVyZWQgYXJyYXkgYW5kIGZpbHRlciBuZXN0ZWQgb2JqZWN0cyBpbnNpZGVcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiBBcnJheS5pc0FycmF5KHN1YnNldCkpIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChmaWx0ZXJBcnJheSh2YWx1ZSwgc3Vic2V0KSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBPbiBuZXN0ZWQgb2JqZWN0cyByZWZlcmVuY2VzLCBidWlsZCBhIGZpbHRlcmVkIG9iamVjdCByZWN1cnNpdmVseVxuICAgICAgaWYgKGlzT2JqZWN0KHZhbHVlKSAmJiBpc09iamVjdChzdWJzZXQpKSB7XG4gICAgICAgIC8vIFdoZW4gYm90aCBvcGVyYW5kcyBhcmUgbWFwcywgYnVpbGQgYSBmaWx0ZXJlZCBtYXAgd2l0aCBjb21tb24ga2V5cyBhbmQgZmlsdGVyIG5lc3RlZCBvYmplY3RzIGluc2lkZVxuICAgICAgICBpZiAoKHZhbHVlIGluc3RhbmNlb2YgTWFwKSAmJiAoc3Vic2V0IGluc3RhbmNlb2YgTWFwKSkge1xuICAgICAgICAgIGNvbnN0IG1hcCA9IG5ldyBNYXAoXG4gICAgICAgICAgICBbLi4udmFsdWVdLmZpbHRlcigoW2tdKSA9PiBzdWJzZXQuaGFzKGspKVxuICAgICAgICAgICAgICAubWFwKChbaywgdl0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MiA9IHN1YnNldC5nZXQoayk7XG4gICAgICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHYpICYmIGlzT2JqZWN0KHYyKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFtrLCBmaWx0ZXJPYmplY3QodiBhcyBsb29zZSwgdjIgYXMgbG9vc2UpXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gW2ssIHZdO1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGZpbHRlcmVkLnB1c2gobWFwKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gYm90aCBvcGVyYW5kcyBhcmUgc2V0LCBidWlsZCBhIGZpbHRlcmVkIHNldCB3aXRoIGNvbW1vbiB2YWx1ZXNcbiAgICAgICAgaWYgKCh2YWx1ZSBpbnN0YW5jZW9mIFNldCkgJiYgKHN1YnNldCBpbnN0YW5jZW9mIFNldCkpIHtcbiAgICAgICAgICBmaWx0ZXJlZC5wdXNoKHZhbHVlLmludGVyc2VjdGlvbihzdWJzZXQpKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbHRlcmVkLnB1c2goZmlsdGVyT2JqZWN0KHZhbHVlIGFzIGxvb3NlLCBzdWJzZXQgYXMgbG9vc2UpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZpbHRlcmVkLnB1c2godmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFDckMsU0FBUyxZQUFZLFFBQVEsY0FBYztBQUUzQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlCQyxHQUNELE9BQU8sU0FBUyxrQkFDZCxtQ0FBbUM7QUFDbkMsTUFBZ0MsRUFDaEMsUUFBc0MsRUFDdEMsR0FBWTtFQUVaLE9BQU8sYUFDTCxrREFBa0Q7RUFDbEQscUVBQXFFO0VBQ3JFLE9BQU8sUUFBUSxXQUNmLDRGQUE0RjtFQUM1RixxREFBcUQ7RUFDckQsT0FBTyxVQUFVLFdBQ2pCO0FBRUo7QUFJQSxTQUFTLFNBQVMsR0FBWTtFQUM1QixPQUFPLE9BQU8sUUFBUSxZQUFZLFFBQVE7QUFDNUM7QUFFQSxTQUFTLE9BQU8sQ0FBUSxFQUFFLENBQVE7RUFDaEMsTUFBTSxPQUFPLElBQUk7RUFDakIsT0FBTyxhQUFhLEdBQUc7RUFFdkIsU0FBUyxhQUFhLENBQVEsRUFBRSxDQUFRO0lBQ3RD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
// denoCacheMetadata=8371581636419630916,18014181188105425904