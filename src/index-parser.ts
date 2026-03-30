interface Entry {
  pointer: number;
  codePoint: number;
  description: string;
}
type Index = Entry[];
export type { Index as default };

function* lines(input: string): Generator<string> {
  while (input.length > 0) {
    const index = input.indexOf("\n");
    if (index === -1) {
      break;
    }
    const before = input.slice(0, index);
    const after = input.slice(index + 1);
    input = after;
    yield before;
  }
  if (input.length > 0) {
    yield input;
  }
}

export function parse(input: string): Index {
  const result: Index = [];
  const seenPointers = new Map<number, { line: number; column: number }>();
  let lineCount = 0;
  for (const line of lines(input)) {
    lineCount++;
    const lineWithoutCRLF = line.slice(0, -(line.endsWith("\r\n") ? 2 : 1));

    if (lineWithoutCRLF.startsWith("#")) {
      continue;
    }

    if (lineWithoutCRLF === "") {
      continue;
    }

    const columns = lineWithoutCRLF.split("\t", 3);
    if (columns.length !== 3) {
      throw Object.assign(
        new DOMException(
          `${JSON.stringify(lineWithoutCRLF)} does not have 3 columns at ${lineCount}:1`,
          "SyntaxError",
        ),
        { input, line: lineCount, column: 1 },
      );
    }
    const pointerText = columns[0];
    const codePointText = columns[1];
    const description = columns[2];

    const pointerMatch = pointerText.match(/^ *([1-9][0-9]*|0)$/);
    if (!pointerMatch) {
      throw Object.assign(
        new DOMException(
          `'${pointerText}' is not a valid pointer at ${lineCount}:1`,
          "SyntaxError",
        ),
        { input, line: lineCount, column: 1 },
      );
    }
    const pointer = Number.parseInt(pointerMatch[1], 10);

    const codePointMatch = codePointText.match(/^ *0x([0-9a-fA-F]+)$/);
    if (!codePointMatch) {
      const column = pointerText.length + 1;
      throw Object.assign(
        new DOMException(
          `'${codePointText}' is not a valid code point at ${lineCount}:${column}`,
          "SyntaxError",
        ),
        { input, line: lineCount, column },
      );
    }
    const codePoint = Number.parseInt(codePointMatch[1], 16);

    const seenPointer = seenPointers.get(pointer);
    if (seenPointer) {
      const column = 1;
      throw Object.assign(
        new DOMException(
          `Duplicate pointer ${pointer} at ${lineCount}:${column}. First appearance was at ${seenPointer.line}:${seenPointer.column}`,
          "SyntaxError",
        ),
        { input, line: lineCount, column, firstAppearance: seenPointer },
      );
    }
    seenPointers.set(pointer, { line: lineCount, column: 1 });

    result.push({ pointer, codePoint, description });
  }

  return result;
}

export function createEncoderMap(index: Index): Map<number, number> {
  const result = new Map<number, number>();
  for (const entry of index) {
    if (result.has(entry.codePoint)) {
      continue;
    }
    result.set(entry.codePoint, entry.pointer);
  }
  return result;
}

if (import.meta.vitest) {
  const { test, expect } = await import("vitest");
  const { bench, run, do_not_optimize } = await import("mitata");

  test("parse Big5 index", async () => {
    const response = await fetch("https://encoding.spec.whatwg.org/index-big5.txt");
    const text = await response.text();

    const index = parse(text);

    for (const entry of index) {
      expect(typeof entry.pointer).toBe("number");
      expect(typeof entry.codePoint).toBe("number");
    }

    const map = createEncoderMap(index);
    expect(map).toBeDefined();
  });

  test("parse ISO-8859-14 index", async () => {
    const response = await fetch("https://encoding.spec.whatwg.org/index-iso-8859-14.txt");
    const text = await response.text();

    const index = parse(text);

    for (const entry of index) {
      expect(typeof entry.pointer).toBe("number");
      expect(typeof entry.codePoint).toBe("number");
    }

    const map = createEncoderMap(index);
    expect(map).toBeDefined();
  });

  test("bench", { timeout: 60_000 }, async () => {
    const big_5_input = (async () => {
      const response = await fetch("https://encoding.spec.whatwg.org/index-big5.txt");
      return await response.text();
    })();

    bench("parse Big5 index", async () => {
      const index = parse(await big_5_input);
      const map = createEncoderMap(index);
      do_not_optimize(map);
    });

    const iso_8859_14_input = (async () => {
      const response = await fetch("https://encoding.spec.whatwg.org/index-iso-8859-14.txt");
      return await response.text();
    })();

    bench("parse ISO-8859-14 index", async () => {
      const index = parse(await iso_8859_14_input);
      const map = createEncoderMap(index);
      do_not_optimize(map);
    });

    await run();
  });
}
