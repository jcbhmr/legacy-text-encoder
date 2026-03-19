/**
 * @module
 *
 * 🔎 A `TextEncoder` and `TextEncoderStream` that supports [the legacy
 * encodings](https://encoding.spec.whatwg.org/#concept-encoding-get)
 *
 * The standard `TextEncoder` and `TextEncoderStream` do not support encoding
 * text into legacy encoding formats; only UTF-8 is supported. It's highly
 * recommended to [use UTF-8 everywhere](https://utf8everywhere.org/) and avoid
 * storing data using legacy encodings. But sometimes that's unavoidable, and
 * this module provides a way to encode text into legacy encodings in those
 * cases.
 *
 * The API structure is similar to the standard `TextEncoder` and
 * `TextEncoderStream`. Web IDL type conversions are applied to the input
 * parameters.
 *
 * @example Encoding a JavaScript `string` primitive (UTF-16 code units
 * internally) into a `Uint8Array` of UTF-16LE bytes.
 *
 * ```ts
 * const encoder = new LegacyTextEncoder("utf-16le");
 * const bytes = encoder.encode("Hi!");
 * assert.deepEqual(bytes, Uint8Array.of(0x48, 0x00, 0x69, 0x00, 0x21, 0x00));
 * ```
 *
 * @example Encoding a `ReadableStream` of UTF-8 bytes into Windows-1252
 * (ASCII-ish) bytes and writing the result to a file using `node:fs`.
 *
 * ```ts
 * let chunks: Uint8Array[] = [];
 * const writable = new WritableStream<Uint8Array<ArrayBuffer>>({
 *   write(chunk) {
 *     chunks.push(chunk);
 *   }
 * });
 *
 * await ReadableStream.from(["Hi", "!"])
 *  .pipeThrough(new LegacyTextEncoderStream("windows-1252"))
 *  .pipeTo(writable);
 *
 * assert.deepEqual(chunks, [
 *   Uint8Array.of(0x48, 0x69),
 *   Uint8Array.of(0x21),
 * ])
 * ```
 */
void 0;

import { registerEncoding } from "./encodings.ts";
import * as gbk from "./gbk.ts";
import * as gb18030 from "./gb18030.ts";
import * as big5 from "./big5.ts";
import * as euc_jp from "./euc_jp.ts";
import * as iso_2022_jp from "./iso_222_jp.ts";
import * as shift_jis from "./shift_jis.ts";
import * as euc_kr from "./euc_kr.ts";
import * as single_byte from "./single_byte/mod.ts";
import * as utf16 from "./utf16.ts";
import * as x_user_defined from "./x_user_defined.ts";

export { LegacyTextEncoder, LegacyTextEncoderStream } from "./api.ts";
