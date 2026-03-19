export class LegacyTextEncoderStream implements TextEncoderStream {
  #transform: TransformStream<string, Uint8Array<ArrayBuffer>>;
  #encoding: Encoding;
  constructor(label: string = "utf-8") {
    this.#transform = undefined as any;
  }

  get readable(): ReadableStream<Uint8Array<ArrayBuffer>> {
    return this.#transform.readable;
  }

  get writable(): WritableStream<string> {
    return this.#transform.writable;
  }

  get encoding(): string {
    return this.#encoding.name.toLowerCase();
  }
}
