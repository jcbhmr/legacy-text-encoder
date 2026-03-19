import IOQueue from "./IOQueue.ts";

export default interface Encoding {
  name: string;
  labels: string[];
  encoder: { new (): Encoder };
  decoder: never;
}

export interface HandlerError {
  type: "HandlerError";
  value: number | null;
}

export interface Encoder {
  handler(input: IOQueue, item: number): "finished" | number[] | HandlerError | "continue";
}

const encodings = new Map<string, Encoding>();
export function register(encoding: Encoding) {
  if (encodings.has(encoding.name)) {
    throw new TypeError();
  }
  encodings.set(encoding.name, encoding);
}

export function getAnEncoding(label: string): Encoding | "failure" {}
