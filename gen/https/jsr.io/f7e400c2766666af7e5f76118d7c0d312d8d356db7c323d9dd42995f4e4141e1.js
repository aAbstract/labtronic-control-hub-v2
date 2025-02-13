// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { diff } from "./diff.ts";
/**
 * Unescape invisible characters.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#escape_sequences}
 *
 * @param string String to unescape.
 *
 * @returns Unescaped string.
 *
 * @example Usage
 * ```ts
 * import { unescape } from "@std/internal/diff-str";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(unescape("Hello\nWorld"), "Hello\\n\nWorld");
 * ```
 */ export function unescape(string) {
  return string.replaceAll("\b", "\\b").replaceAll("\f", "\\f").replaceAll("\t", "\\t").replaceAll("\v", "\\v")// This does not remove line breaks
  .replaceAll(/\r\n|\r|\n/g, (str)=>str === "\r" ? "\\r" : str === "\n" ? "\\n\n" : "\\r\\n\r\n");
}
const WHITESPACE_SYMBOLS = /([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/;
/**
 * Tokenizes a string into an array of tokens.
 *
 * @param string The string to tokenize.
 * @param wordDiff If true, performs word-based tokenization. Default is false.
 *
 * @returns An array of tokens.
 *
 * @example Usage
 * ```ts
 * import { tokenize } from "@std/internal/diff-str";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(tokenize("Hello\nWorld"), ["Hello\n", "World"]);
 * ```
 */ export function tokenize(string, wordDiff = false) {
  if (wordDiff) {
    return string.split(WHITESPACE_SYMBOLS).filter((token)=>token);
  }
  const tokens = [];
  const lines = string.split(/(\n|\r\n)/).filter((line)=>line);
  for (const [i, line] of lines.entries()){
    if (i % 2) {
      tokens[tokens.length - 1] += line;
    } else {
      tokens.push(line);
    }
  }
  return tokens;
}
/**
 * Create details by filtering relevant word-diff for current line and merge
 * "space-diff" if surrounded by word-diff for cleaner displays.
 *
 * @param line Current line
 * @param tokens Word-diff tokens
 *
 * @returns Array of diff results.
 *
 * @example Usage
 * ```ts
 * import { createDetails } from "@std/internal/diff-str";
 * import { assertEquals } from "@std/assert";
 *
 * const tokens = [
 *   { type: "added", value: "a" },
 *   { type: "removed", value: "b" },
 *   { type: "common", value: "c" },
 * ] as const;
 * assertEquals(
 *   createDetails({ type: "added", value: "a" }, [...tokens]),
 *   [{ type: "added", value: "a" }, { type: "common", value: "c" }]
 * );
 * ```
 */ export function createDetails(line, tokens) {
  return tokens.filter(({ type })=>type === line.type || type === "common").map((result, i, t)=>{
    const token = t[i - 1];
    if (result.type === "common" && token && token.type === t[i + 1]?.type && /\s+/.test(result.value)) {
      return {
        ...result,
        type: token.type
      };
    }
    return result;
  });
}
const NON_WHITESPACE_REGEXP = /\S/;
/**
 * Renders the differences between the actual and expected strings. Partially
 * inspired from {@link https://github.com/kpdecker/jsdiff}.
 *
 * @param A Actual string
 * @param B Expected string
 *
 * @returns Array of diff results.
 *
 * @example Usage
 * ```ts
 * import { diffStr } from "@std/internal/diff-str";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(diffStr("Hello!", "Hello"), [
 *   {
 *     type: "removed",
 *     value: "Hello!\n",
 *     details: [
 *       { type: "common", value: "Hello" },
 *       { type: "removed", value: "!" },
 *       { type: "common", value: "\n" }
 *     ]
 *   },
 *   {
 *     type: "added",
 *     value: "Hello\n",
 *     details: [
 *       { type: "common", value: "Hello" },
 *       { type: "common", value: "\n" }
 *     ]
 *   }
 * ]);
 * ```
 */ export function diffStr(A, B) {
  // Compute multi-line diff
  const diffResult = diff(tokenize(`${unescape(A)}\n`), tokenize(`${unescape(B)}\n`));
  const added = [];
  const removed = [];
  for (const result of diffResult){
    if (result.type === "added") {
      added.push(result);
    }
    if (result.type === "removed") {
      removed.push(result);
    }
  }
  // Compute word-diff
  const hasMoreRemovedLines = added.length < removed.length;
  const aLines = hasMoreRemovedLines ? added : removed;
  const bLines = hasMoreRemovedLines ? removed : added;
  for (const a of aLines){
    let tokens = [];
    let b;
    // Search another diff line with at least one common token
    while(bLines.length){
      b = bLines.shift();
      const tokenized = [
        tokenize(a.value, true),
        tokenize(b.value, true)
      ];
      if (hasMoreRemovedLines) tokenized.reverse();
      tokens = diff(tokenized[0], tokenized[1]);
      if (tokens.some(({ type, value })=>type === "common" && NON_WHITESPACE_REGEXP.test(value))) {
        break;
      }
    }
    // Register word-diff details
    a.details = createDetails(a, tokens);
    if (b) {
      b.details = createDetails(b, tokens);
    }
  }
  return diffResult;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaW50ZXJuYWwvMS4wLjQvZGlmZl9zdHIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB0eXBlIHsgRGlmZlJlc3VsdCB9IGZyb20gXCIuL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBkaWZmIH0gZnJvbSBcIi4vZGlmZi50c1wiO1xuXG4vKipcbiAqIFVuZXNjYXBlIGludmlzaWJsZSBjaGFyYWN0ZXJzLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZyNlc2NhcGVfc2VxdWVuY2VzfVxuICpcbiAqIEBwYXJhbSBzdHJpbmcgU3RyaW5nIHRvIHVuZXNjYXBlLlxuICpcbiAqIEByZXR1cm5zIFVuZXNjYXBlZCBzdHJpbmcuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB1bmVzY2FwZSB9IGZyb20gXCJAc3RkL2ludGVybmFsL2RpZmYtc3RyXCI7XG4gKiBpbXBvcnQgeyBhc3NlcnRFcXVhbHMgfSBmcm9tIFwiQHN0ZC9hc3NlcnRcIjtcbiAqXG4gKiBhc3NlcnRFcXVhbHModW5lc2NhcGUoXCJIZWxsb1xcbldvcmxkXCIpLCBcIkhlbGxvXFxcXG5cXG5Xb3JsZFwiKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGUoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyaW5nXG4gICAgLnJlcGxhY2VBbGwoXCJcXGJcIiwgXCJcXFxcYlwiKVxuICAgIC5yZXBsYWNlQWxsKFwiXFxmXCIsIFwiXFxcXGZcIilcbiAgICAucmVwbGFjZUFsbChcIlxcdFwiLCBcIlxcXFx0XCIpXG4gICAgLnJlcGxhY2VBbGwoXCJcXHZcIiwgXCJcXFxcdlwiKVxuICAgIC8vIFRoaXMgZG9lcyBub3QgcmVtb3ZlIGxpbmUgYnJlYWtzXG4gICAgLnJlcGxhY2VBbGwoXG4gICAgICAvXFxyXFxufFxccnxcXG4vZyxcbiAgICAgIChzdHIpID0+IHN0ciA9PT0gXCJcXHJcIiA/IFwiXFxcXHJcIiA6IHN0ciA9PT0gXCJcXG5cIiA/IFwiXFxcXG5cXG5cIiA6IFwiXFxcXHJcXFxcblxcclxcblwiLFxuICAgICk7XG59XG5cbmNvbnN0IFdISVRFU1BBQ0VfU1lNQk9MUyA9IC8oW15cXFNcXHJcXG5dK3xbKClbXFxde30nXCJcXHJcXG5dfFxcYikvO1xuXG4vKipcbiAqIFRva2VuaXplcyBhIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIHRva2Vucy5cbiAqXG4gKiBAcGFyYW0gc3RyaW5nIFRoZSBzdHJpbmcgdG8gdG9rZW5pemUuXG4gKiBAcGFyYW0gd29yZERpZmYgSWYgdHJ1ZSwgcGVyZm9ybXMgd29yZC1iYXNlZCB0b2tlbml6YXRpb24uIERlZmF1bHQgaXMgZmFsc2UuXG4gKlxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgdG9rZW5zLlxuICpcbiAqIEBleGFtcGxlIFVzYWdlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgdG9rZW5pemUgfSBmcm9tIFwiQHN0ZC9pbnRlcm5hbC9kaWZmLXN0clwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKHRva2VuaXplKFwiSGVsbG9cXG5Xb3JsZFwiKSwgW1wiSGVsbG9cXG5cIiwgXCJXb3JsZFwiXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplKHN0cmluZzogc3RyaW5nLCB3b3JkRGlmZiA9IGZhbHNlKTogc3RyaW5nW10ge1xuICBpZiAod29yZERpZmYpIHtcbiAgICByZXR1cm4gc3RyaW5nXG4gICAgICAuc3BsaXQoV0hJVEVTUEFDRV9TWU1CT0xTKVxuICAgICAgLmZpbHRlcigodG9rZW4pID0+IHRva2VuKTtcbiAgfVxuICBjb25zdCB0b2tlbnM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGxpbmVzID0gc3RyaW5nLnNwbGl0KC8oXFxufFxcclxcbikvKS5maWx0ZXIoKGxpbmUpID0+IGxpbmUpO1xuXG4gIGZvciAoY29uc3QgW2ksIGxpbmVdIG9mIGxpbmVzLmVudHJpZXMoKSkge1xuICAgIGlmIChpICUgMikge1xuICAgICAgdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSArPSBsaW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b2tlbnMucHVzaChsaW5lKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRva2Vucztcbn1cblxuLyoqXG4gKiBDcmVhdGUgZGV0YWlscyBieSBmaWx0ZXJpbmcgcmVsZXZhbnQgd29yZC1kaWZmIGZvciBjdXJyZW50IGxpbmUgYW5kIG1lcmdlXG4gKiBcInNwYWNlLWRpZmZcIiBpZiBzdXJyb3VuZGVkIGJ5IHdvcmQtZGlmZiBmb3IgY2xlYW5lciBkaXNwbGF5cy5cbiAqXG4gKiBAcGFyYW0gbGluZSBDdXJyZW50IGxpbmVcbiAqIEBwYXJhbSB0b2tlbnMgV29yZC1kaWZmIHRva2Vuc1xuICpcbiAqIEByZXR1cm5zIEFycmF5IG9mIGRpZmYgcmVzdWx0cy5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNyZWF0ZURldGFpbHMgfSBmcm9tIFwiQHN0ZC9pbnRlcm5hbC9kaWZmLXN0clwiO1xuICogaW1wb3J0IHsgYXNzZXJ0RXF1YWxzIH0gZnJvbSBcIkBzdGQvYXNzZXJ0XCI7XG4gKlxuICogY29uc3QgdG9rZW5zID0gW1xuICogICB7IHR5cGU6IFwiYWRkZWRcIiwgdmFsdWU6IFwiYVwiIH0sXG4gKiAgIHsgdHlwZTogXCJyZW1vdmVkXCIsIHZhbHVlOiBcImJcIiB9LFxuICogICB7IHR5cGU6IFwiY29tbW9uXCIsIHZhbHVlOiBcImNcIiB9LFxuICogXSBhcyBjb25zdDtcbiAqIGFzc2VydEVxdWFscyhcbiAqICAgY3JlYXRlRGV0YWlscyh7IHR5cGU6IFwiYWRkZWRcIiwgdmFsdWU6IFwiYVwiIH0sIFsuLi50b2tlbnNdKSxcbiAqICAgW3sgdHlwZTogXCJhZGRlZFwiLCB2YWx1ZTogXCJhXCIgfSwgeyB0eXBlOiBcImNvbW1vblwiLCB2YWx1ZTogXCJjXCIgfV1cbiAqICk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURldGFpbHMoXG4gIGxpbmU6IERpZmZSZXN1bHQ8c3RyaW5nPixcbiAgdG9rZW5zOiBEaWZmUmVzdWx0PHN0cmluZz5bXSxcbik6IERpZmZSZXN1bHQ8c3RyaW5nPltdIHtcbiAgcmV0dXJuIHRva2Vucy5maWx0ZXIoKHsgdHlwZSB9KSA9PiB0eXBlID09PSBsaW5lLnR5cGUgfHwgdHlwZSA9PT0gXCJjb21tb25cIilcbiAgICAubWFwKChyZXN1bHQsIGksIHQpID0+IHtcbiAgICAgIGNvbnN0IHRva2VuID0gdFtpIC0gMV07XG4gICAgICBpZiAoXG4gICAgICAgIChyZXN1bHQudHlwZSA9PT0gXCJjb21tb25cIikgJiYgdG9rZW4gJiZcbiAgICAgICAgKHRva2VuLnR5cGUgPT09IHRbaSArIDFdPy50eXBlKSAmJiAvXFxzKy8udGVzdChyZXN1bHQudmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgdHlwZTogdG9rZW4udHlwZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG59XG5cbmNvbnN0IE5PTl9XSElURVNQQUNFX1JFR0VYUCA9IC9cXFMvO1xuXG4vKipcbiAqIFJlbmRlcnMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGFjdHVhbCBhbmQgZXhwZWN0ZWQgc3RyaW5ncy4gUGFydGlhbGx5XG4gKiBpbnNwaXJlZCBmcm9tIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20va3BkZWNrZXIvanNkaWZmfS5cbiAqXG4gKiBAcGFyYW0gQSBBY3R1YWwgc3RyaW5nXG4gKiBAcGFyYW0gQiBFeHBlY3RlZCBzdHJpbmdcbiAqXG4gKiBAcmV0dXJucyBBcnJheSBvZiBkaWZmIHJlc3VsdHMuXG4gKlxuICogQGV4YW1wbGUgVXNhZ2VcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBkaWZmU3RyIH0gZnJvbSBcIkBzdGQvaW50ZXJuYWwvZGlmZi1zdHJcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJAc3RkL2Fzc2VydFwiO1xuICpcbiAqIGFzc2VydEVxdWFscyhkaWZmU3RyKFwiSGVsbG8hXCIsIFwiSGVsbG9cIiksIFtcbiAqICAge1xuICogICAgIHR5cGU6IFwicmVtb3ZlZFwiLFxuICogICAgIHZhbHVlOiBcIkhlbGxvIVxcblwiLFxuICogICAgIGRldGFpbHM6IFtcbiAqICAgICAgIHsgdHlwZTogXCJjb21tb25cIiwgdmFsdWU6IFwiSGVsbG9cIiB9LFxuICogICAgICAgeyB0eXBlOiBcInJlbW92ZWRcIiwgdmFsdWU6IFwiIVwiIH0sXG4gKiAgICAgICB7IHR5cGU6IFwiY29tbW9uXCIsIHZhbHVlOiBcIlxcblwiIH1cbiAqICAgICBdXG4gKiAgIH0sXG4gKiAgIHtcbiAqICAgICB0eXBlOiBcImFkZGVkXCIsXG4gKiAgICAgdmFsdWU6IFwiSGVsbG9cXG5cIixcbiAqICAgICBkZXRhaWxzOiBbXG4gKiAgICAgICB7IHR5cGU6IFwiY29tbW9uXCIsIHZhbHVlOiBcIkhlbGxvXCIgfSxcbiAqICAgICAgIHsgdHlwZTogXCJjb21tb25cIiwgdmFsdWU6IFwiXFxuXCIgfVxuICogICAgIF1cbiAqICAgfVxuICogXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZTdHIoQTogc3RyaW5nLCBCOiBzdHJpbmcpOiBEaWZmUmVzdWx0PHN0cmluZz5bXSB7XG4gIC8vIENvbXB1dGUgbXVsdGktbGluZSBkaWZmXG4gIGNvbnN0IGRpZmZSZXN1bHQgPSBkaWZmKFxuICAgIHRva2VuaXplKGAke3VuZXNjYXBlKEEpfVxcbmApLFxuICAgIHRva2VuaXplKGAke3VuZXNjYXBlKEIpfVxcbmApLFxuICApO1xuXG4gIGNvbnN0IGFkZGVkID0gW107XG4gIGNvbnN0IHJlbW92ZWQgPSBbXTtcbiAgZm9yIChjb25zdCByZXN1bHQgb2YgZGlmZlJlc3VsdCkge1xuICAgIGlmIChyZXN1bHQudHlwZSA9PT0gXCJhZGRlZFwiKSB7XG4gICAgICBhZGRlZC5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQudHlwZSA9PT0gXCJyZW1vdmVkXCIpIHtcbiAgICAgIHJlbW92ZWQucHVzaChyZXN1bHQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENvbXB1dGUgd29yZC1kaWZmXG4gIGNvbnN0IGhhc01vcmVSZW1vdmVkTGluZXMgPSBhZGRlZC5sZW5ndGggPCByZW1vdmVkLmxlbmd0aDtcbiAgY29uc3QgYUxpbmVzID0gaGFzTW9yZVJlbW92ZWRMaW5lcyA/IGFkZGVkIDogcmVtb3ZlZDtcbiAgY29uc3QgYkxpbmVzID0gaGFzTW9yZVJlbW92ZWRMaW5lcyA/IHJlbW92ZWQgOiBhZGRlZDtcbiAgZm9yIChjb25zdCBhIG9mIGFMaW5lcykge1xuICAgIGxldCB0b2tlbnMgPSBbXSBhcyBBcnJheTxEaWZmUmVzdWx0PHN0cmluZz4+O1xuICAgIGxldCBiOiB1bmRlZmluZWQgfCBEaWZmUmVzdWx0PHN0cmluZz47XG4gICAgLy8gU2VhcmNoIGFub3RoZXIgZGlmZiBsaW5lIHdpdGggYXQgbGVhc3Qgb25lIGNvbW1vbiB0b2tlblxuICAgIHdoaWxlIChiTGluZXMubGVuZ3RoKSB7XG4gICAgICBiID0gYkxpbmVzLnNoaWZ0KCk7XG4gICAgICBjb25zdCB0b2tlbml6ZWQgPSBbXG4gICAgICAgIHRva2VuaXplKGEudmFsdWUsIHRydWUpLFxuICAgICAgICB0b2tlbml6ZShiIS52YWx1ZSwgdHJ1ZSksXG4gICAgICBdIGFzIFtzdHJpbmdbXSwgc3RyaW5nW11dO1xuICAgICAgaWYgKGhhc01vcmVSZW1vdmVkTGluZXMpIHRva2VuaXplZC5yZXZlcnNlKCk7XG4gICAgICB0b2tlbnMgPSBkaWZmKHRva2VuaXplZFswXSwgdG9rZW5pemVkWzFdKTtcbiAgICAgIGlmIChcbiAgICAgICAgdG9rZW5zLnNvbWUoKHsgdHlwZSwgdmFsdWUgfSkgPT5cbiAgICAgICAgICB0eXBlID09PSBcImNvbW1vblwiICYmIE5PTl9XSElURVNQQUNFX1JFR0VYUC50ZXN0KHZhbHVlKVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlZ2lzdGVyIHdvcmQtZGlmZiBkZXRhaWxzXG4gICAgYS5kZXRhaWxzID0gY3JlYXRlRGV0YWlscyhhLCB0b2tlbnMpO1xuICAgIGlmIChiKSB7XG4gICAgICBiLmRldGFpbHMgPSBjcmVhdGVEZXRhaWxzKGIsIHRva2Vucyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRpZmZSZXN1bHQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLFlBQVk7QUFFakM7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQkMsR0FDRCxPQUFPLFNBQVMsU0FBUyxNQUFjO0VBQ3JDLE9BQU8sT0FDSixVQUFVLENBQUMsTUFBTSxPQUNqQixVQUFVLENBQUMsTUFBTSxPQUNqQixVQUFVLENBQUMsTUFBTSxPQUNqQixVQUFVLENBQUMsTUFBTSxNQUNsQixtQ0FBbUM7R0FDbEMsVUFBVSxDQUNULGVBQ0EsQ0FBQyxNQUFRLFFBQVEsT0FBTyxRQUFRLFFBQVEsT0FBTyxVQUFVO0FBRS9EO0FBRUEsTUFBTSxxQkFBcUI7QUFFM0I7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBQ0QsT0FBTyxTQUFTLFNBQVMsTUFBYyxFQUFFLFdBQVcsS0FBSztFQUN2RCxJQUFJLFVBQVU7SUFDWixPQUFPLE9BQ0osS0FBSyxDQUFDLG9CQUNOLE1BQU0sQ0FBQyxDQUFDLFFBQVU7RUFDdkI7RUFDQSxNQUFNLFNBQW1C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
// denoCacheMetadata=11578548737734846761,2045021064976961681