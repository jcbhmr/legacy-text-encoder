import type IndexType from "./index-parser.ts";
import * as Index from "./index-parser.ts";

export async function createIndex(): Promise<IndexType> {
  const response = await fetch("https://encoding.spec.whatwg.org/index-big5.txt");
  if (response.status !== 200) {
    throw new DOMException(
      `${response.url} responded with ${response.status} ${response.statusText}`,
    );
  }
  const contentType = response.headers.get("Content-Type");
  if (contentType == null || !/^text\/plain(?:;|$)/.test(contentType)) {
    throw new DOMException(
      `${response.url} responded with a non-'text/plain' Content-Type: ${contentType}`,
    );
  }
  const text = await response.text();
  const index = Index.parse(text);
  return index;
}

export async function createEncoderRecord(): Promise<Record<number, number>> {
  const index = await createIndex();
  const map = Index.createEncoderMap(index);
  const record: Record<number, number> = { __proto__: null } as Record<number, number>;
  for (const [codePoint, pointer] of map) {
    record[codePoint] = pointer;
  }
  return record;
}

if (import.meta.vitest) {
  const { test } = await import("vitest");

  const inlineIndex = await createIndex();
  const inlineEncoderRecord = await createEncoderRecord();

  test("info", () => {
    console.log("Big5 index has %d entries", inlineIndex.length);
    // console.table(inlineIndex);
    console.log("Big5 encoder record has %d entries", Object.keys(inlineEncoderRecord).length);
    // console.table(inlineEncoderRecord);
  });
}
