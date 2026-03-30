import type { ScalarValue } from "../infra.ts";

export default class ImmediateReadableIOQueueScalarValue implements IterableIterator<
  ScalarValue,
  never,
  undefined
> {
  static fromString(string: string): ImmediateReadableIOQueueScalarValue {
    const that = new ImmediateReadableIOQueueScalarValue();
    that.#it = string[Symbol.iterator]();
    return that;
  }

  #it: StringIterator<string> = undefined!;
  #restored: ScalarValue | undefined;
  private constructor() {}

  [Symbol.iterator](): IterableIterator<ScalarValue, never, undefined> {
    return this;
  }

  next(): IteratorResult<ScalarValue, never> {
    if (this.#restored !== undefined) {
      const restored = this.#restored;
      this.#restored = undefined;
      return { value: restored, done: false };
    }

    const { value, done } = this.#it.next();
    if (done) {
      return { value: undefined!, done: true };
    }

    const sv = value.codePointAt(0)! as ScalarValue;
    return { value: sv, done: false };
  }

  restore(item: ScalarValue): void {
    if (this.#restored !== undefined) {
      throw new DOMException("Cannot restore more than one item", "InvalidStateError");
    }
    this.#restored = item;
  }
}

if (import.meta.vitest) {
  const { test, expect } = await import("vitest");
  const { run, bench, boxplot, summary } = await import("mitata");
  type k_state = import("mitata").k_state;

  test("'Hello, Alan Turing' reads back", () => {
    const input = "Hello, Alan Turing";
    const expected = Array.from(input, (c) => c.codePointAt(0)!);
    const queue = ImmediateReadableIOQueueScalarValue.fromString(input);
    const actual = [...queue];
    expect(actual).toEqual(expected);
  });

  test("restoring works", () => {
    const queue = ImmediateReadableIOQueueScalarValue.fromString("A");
    expect(queue.next()).toMatchObject({ value: "A".codePointAt(0)!, done: false });
    queue.restore("A".codePointAt(0)! as ScalarValue);
    expect(queue.next()).toMatchObject({ value: "A".codePointAt(0)!, done: false });
    queue.restore("A".codePointAt(0)! as ScalarValue);
    expect(queue.next()).toMatchObject({ value: "A".codePointAt(0)!, done: false });
    expect(queue.next()).toMatchObject({ done: true });
  });

  test("bench", async () => {
    bench("fibonacci(40)", () => fibonacci(40));

    boxplot(() => {
      summary(() => {
        bench("Array.from($size)", function* (state: k_state) {
          const size = state.get("size");
          yield () => Array.from({ length: size });
        }).range("size", 1, 1024);
      });
    });

    await run();
  });
}
