export class IOQueue<T> {
  #array: T[] = [];
  constructor(initial: (T | EndOfStream)[] = []) {
    for (const x of initial) {
      if (isEndOfStream(x)) {
        break;
      }
      this.#array.push(x);
    }
  }
}

export type EndOfStream = Branded<{}, "end-of-stream">;
