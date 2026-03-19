import type { Tagged } from "type-fest";

export type ASCIICodePoint = Tagged<number, "ASCII code point">;
export function isASCIICodePoint(value: number): value is ASCIICodePoint {
  return 0x0000 <= value && value <= 0x007f;
}
