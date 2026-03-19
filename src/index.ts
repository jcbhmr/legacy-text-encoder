/**
 * A `LegacyTextEncoder` encodes strings into bytes according to a specified
 * legacy encoding. It is intended for use in contexts where legacy encodings
 * are required, such as when working with legacy APIs or file formats that
 * do not support UTF-8. For UTF-8 encoding, the standard `TextEncoder` should
 * be used instead.
 */
export default class LegacyTextEncoder implements TextEncoder {
  #encoding: Encoding;
  #encoder: Encoder;
  #ioQueue: IOQueue<webidl.Byte>;
  /**
   * Creates a new `LegacyTextEncoder` for the given encoding label.
   *
   * @param label Any valid character encoding label. Case-insensitive and trimmed of leading and trailing ASCII whitespace.
   * @throws {RangeError} Throws if {@link label} is an unknown encoding.
   * @throws {RangeError} Throws if {@link label} resolves to the
   * "replacement" encoding.
   * @throws {RangeError} Throws if {@link label} resolves to the "utf-8"
   * encoding. Use the standard `TextEncoder` instead.
   *
   * @example Use a `TextEncoder` for UTF-8 encoding
   *
   * ```ts
   * const encoder = new LegacyTextEncoder("utf-8");
   * //              ^! RangeError: Use standard TextEncoder for UTF-8 encoding
   *
   * const encoder = new TextEncoder(); // Always UTF-8.
   * // ...
   * ```
   *
   * @example Throws on invalid label
   *
   * ```ts
   * const encoder = new LegacyTextEncoder("invalid");
   * //              ^! RangeError: Encoding 'invalid' is not supported
   * ```
   *
   * @example Create a `TextEncoder` for Windows-1252 encoding
   *
   * ```ts
   * const encoder = new LegacyTextEncoder("windows-1252");
   * // ...
   * ```
   */
  constructor(label: string) {
    const idlLabel =
      label === undefined ? throw_(new TypeError("Missing required argument 'label'")) : `${label}`;

    // Implementation based on https://encoding.spec.whatwg.org/#dom-textdecoder
    const encoding = getAnEncoding(idlLabel);
    if (encoding === failure || encoding === replacement) {
      throw new RangeError(`Encoding ${idlLabel} is not supported`);
    }
    this.#encoding = encoding;
  }

  /**
   * The canonical name of the encoding this `LegacyTextEncoder` encodes to, as a lowercased string.
   *
   * @example
   * ```ts
   * const encoder = new LegacyTextEncoder("us-ascii");
   * assert.equal(encoder.encoding, "windows-1252");
   * ```
   */
  get encoding(): string {
    return this.#encoding.name;
  }

  /**
   * Returns a `Uint8Array` containing the encoded bytes of the given input
   * string according to the encoding of this `LegacyTextEncoder` specified
   * when constructed.
   *
   * @param input A `USVString` (no unpaired UTF-16 surrogate code units)
   * containing the text to encode.
   * @returns A `Uint8Array` containing the encoded bytes.
   * @throws {TypeError} Throws if there is a decoding error.
   *
   * @example Throws an error if the text cannot be encoded into the desired encoding's character set.
   *
   * ```ts
   * const encoder = new LegacyTextEncoder("windows-1252");
   * const bytes = encoder.encode("🚀")
   * //            ^! TypeError: Cannot encode text into windows-1252
   * ```
   *
   * @example Encodes a string into Windows-1252 bytes.
   *
   * ```ts
   * const encoder = new LegacyTextEncoder("windows-1252");
   * const bytes = encoder.encode("Hi!");
   * assert.deepEqual(bytes, Uint8Array.of(0x48, 0x69, 0x21));
   * ```
   */
  // Why no `options: { stream: boolean; }`? Because `USVString` can never
  // have unpaired surrogates (they are replaced by U+FFFD), which means no
  // partial code points that would require a stateful encoder.
  encode(input: string = ""): Uint8Array<ArrayBuffer> {
    const idlInput =
      input === undefined
        ? throw_(new TypeError("Missing required argument 'input'"))
        : `${input}`.toWellFormed();

    // Implementation based on https://encoding.spec.whatwg.org/#dom-textencoder-encode
    const inputQueue = IOQueue.convert(idlInput);
    const output = new IOQueue([endOfQueue]);
    while (true) {
      const item = inputQueue.read();
      const result = processAnItem(item, encoder, inputQueue, output, "fatal");
      assert(!(result instanceof HandlerError), "'result is not an error' was false");
      if (result === handlerFinished) {
        return output.bytes();
      }
    }
  }

  encodeInto(
    source: string,
    destination: Uint8Array<ArrayBuffer | SharedArrayBuffer>,
  ): TextEncoderEncodeIntoResult {
    const idlSource =
      source === undefined
        ? throw_(new TypeError("Missing required argument 'source'"))
        : `${source}`.toWellFormed();
    const idlDestination =
      destination === undefined
        ? throw_(new TypeError("Missing required argument 'destination'"))
        : destination instanceof Uint8Array
          ? destination
          : throw_(new TypeError("Argument 'destination' must be a Uint8Array"));

    // Implementation based on https://encoding.spec.whatwg.org/#dom-textencoder-encodeinto
    let read = 0;
    let written = 0;
    const encoder = new this.#encoding.encoder();
    const unused = new IOQueue([endOfQueue]);
    const sourceQueue = IOQueue.convert(source);
    while (true) {
      const item = sourceQueue.read();
      const result = encoder.handle(unused, item);
      if (result === handlerFinished) {
        break;
      } else {
        if (destination.byteLength - written > result.length) {
          if (item > 0xffff) {
            read += 2;
          } else {
            read++;
          }
          destination.set(result, written);
          written += result.length;
        } else {
          break;
        }
      }
    }
    return { read, written };
  }
}
