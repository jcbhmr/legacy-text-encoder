import { Buffer } from "node:buffer";

export function encode(input: string): Uint8Array {
  const buffer = Buffer.from(input, "utf16le");
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
