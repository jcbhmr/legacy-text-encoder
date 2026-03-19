export function isLittleEndian(): boolean {
  // 1 encoded as uint16 is either BE 0x0001 or LE 0x0100
  const uint16s = Uint16Array.of(1);
  const bytes = new Uint8Array(uint16s.buffer, uint16s.byteOffset, uint16s.byteLength);
  return !!bytes[0];
}

function throw_(error: unknown): never {
  throw error;
}
export { throw_ as "throw" };

export function jsToUSVString(js: unknown): string {
  return `${js}`.toWellFormed();
}

export function jsToUint8Array(js: unknown, allowShared: false): Uint8Array<ArrayBuffer>;
export function jsToUint8Array(
  js: unknown,
  allowShared: boolean,
): Uint8Array<ArrayBuffer | SharedArrayBuffer> {
  if (js instanceof Uint8Array) {
    if (!globalThis.SharedArrayBuffer || allowShared) {
      return js;
    }
    if (js.buffer instanceof ArrayBuffer) {
      return js;
    }
  }
  throw new TypeError();
}
