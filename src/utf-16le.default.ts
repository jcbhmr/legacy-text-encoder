import { isLittleEndian } from "./utils.ts";

function encodeDataView(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length * 2);
  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < input.length; i++) {
    dataView.setUint16(i * 2, input.charCodeAt(i), true);
  }
  return bytes;
}

function encodeUint16Array(input: string): Uint8Array {
  const uint16s = new Uint16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    uint16s[i] = input.charCodeAt(i);
  }
  return new Uint8Array(uint16s.buffer);
}

export const encode = isLittleEndian() ? encodeUint16Array : encodeDataView;
