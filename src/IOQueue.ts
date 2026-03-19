/**
 * An I/O queue is a type of list with items of a particular type (i.e., bytes or scalar values).
 *
 * There are two ways to use an I/O queue: in immediate mode, to represent I/O data stored in memory, and in streaming mode, to represent data coming in from the network. Immediate queues have end-of-queue as their last item, whereas streaming queues need not have it, and so their read operation might block.
 *
 * It is expected that streaming I/O queues will be created empty, and that new items will be pushed to it as data comes in from the network. When the underlying network stream closes, an end-of-queue item is to be pushed into the queue.
 *
 * Since reading from a streaming I/O queue might block, streaming I/O queues are not to be used from an event loop. They are to be used in parallel instead.
 */
export default class IOQueue<T extends number> {
  /**
   * End-of-queue is a special item that can be present in I/O queues of any type and it signifies that there are no more items in the queue.
   */
  static endOfQueue = Symbol("IOQueue.endOfQueue");

  #inner: (T | typeof IOQueue.endOfQueue)[] = [];
  #changed: PromiseWithResolvers<void> = Promise.withResolvers<void>();
  constructor() {}

  async read(): Promise<T | typeof IOQueue.endOfQueue> {
    if (this.#inner.length === 0) {
      while (!(this.#inner.length >= 1)) {
        await this.#changed.promise;
      }
    }
    if (this.#inner[0] === IOQueue.endOfQueue) {
      return IOQueue.endOfQueue;
    }
    return this.#inner.shift()!;
  }

  readSync(): T | typeof IOQueue.endOfQueue {
    if (this.#inner.length === 0) {
      while (!(this.#inner.length >= 1)) {
        throw new TypeError();
      }
    }
    if (this.#inner[0] === IOQueue.endOfQueue) {
      return IOQueue.endOfQueue;
    }
    return this.#inner.shift()!;
  }

  async readN(number: number): Promise<(T | typeof IOQueue.endOfQueue)[]> {
    const readItems: (T | typeof IOQueue.endOfQueue)[] = [];
    for (let i = 0; i < number; i++) {
      readItems.push(await this.read());
    }
    return readItems.filter((x) => x !== IOQueue.endOfQueue) as T[];
  }

  readNSync(number: number): (T | typeof IOQueue.endOfQueue)[] {
    const readItems: (T | typeof IOQueue.endOfQueue)[] = [];
    for (let i = 0; i < number; i++) {
      readItems.push(this.readSync());
    }
    return readItems.filter((x) => x !== IOQueue.endOfQueue) as T[];
  }

  async peekN(number: number): Promise<T[]> {
    while (!(this.#inner.length >= number || this.#inner.includes(IOQueue.endOfQueue))) {
      await this.#changed.promise;
    }
    const prefix: T[] = [];
    for (let n = 1; n <= number; n++) {
      if (this.#inner[n] === IOQueue.endOfQueue) {
        break;
      } else {
        prefix.push(this.#inner[n] as T);
      }
    }
    return prefix;
  }

  peekNSync(number: number): T[] {
    while (!(this.#inner.length >= number || this.#inner.includes(IOQueue.endOfQueue))) {
      throw new TypeError();
    }
    const prefix: T[] = [];
    for (let n = 1; n <= number; n++) {
      if (this.#inner[n] === IOQueue.endOfQueue) {
        break;
      } else {
        prefix.push(this.#inner[n] as T);
      }
    }
    return prefix;
  }

  push(item: T | typeof IOQueue.endOfQueue): void {
    if (this.#inner.at(-1) === IOQueue.endOfQueue) {
      if (item === IOQueue.endOfQueue) {
        // nothing
      } else {
        this.#inner.splice(this.#inner.length - 1, 0, item);
      }
    } else {
      this.#inner.push(item);
    }
    this.#changed.resolve();
    this.#changed = Promise.withResolvers();
  }

  pushN(items: (T | typeof IOQueue.endOfQueue)[]): void {
    for (const i of items) {
      this.push(i);
    }
  }

  restore(item: T): void {
    this.#inner.unshift(item);
    this.#changed.resolve();
    this.#changed = Promise.withResolvers();
  }

  restoreList(items: T[]): void {
    this.#inner.unshift(...items);
    this.#changed.resolve();
    this.#changed = Promise.withResolvers();
  }

  async convertToList(): Promise<T[]> {
    const array: T[] = [];
    while (true) {
      const item = await this.read();
      if (item === IOQueue.endOfQueue) {
        return array;
      }
      array.push(item as T);
    }
  }

  convertToListSync(): T[] {
    const array: T[] = [];
    while (true) {
      const item = this.readSync();
      if (item === IOQueue.endOfQueue) {
        return array;
      }
      array.push(item as T);
    }
  }

  async convertToString(): Promise<string> {
    let result = "";
    while (true) {
      const item = await this.read();
      if (item === IOQueue.endOfQueue) {
        return result;
      }
      result += String.fromCharCode(item as T);
    }
  }

  convertToStringSync(): string {
    let result = "";
    while (true) {
      const item = this.readSync();
      if (item === IOQueue.endOfQueue) {
        return result;
      }
      result += String.fromCharCode(item as T);
    }
  }

  // async convertToByteSequence(): Promise<Uint8Array> {}

  // convertToByteSequenceSync(): Uint8Array {}

  static convertListTo<T extends number>(input: T[] | string | Uint8Array): IOQueue<T> {
    if (typeof input === "string") {
      const self = new IOQueue<T>();
      // oxlint-disable-next-line unicorn/no-new-array
      self.#inner = new Array(input.length + 1);
      for (let i = 0; i < input.length; i++) {
        self.#inner[i] = input.charCodeAt(i) as T;
      }
      self.#inner[input.length] = IOQueue.endOfQueue;
      return self;
    } else if (input instanceof Uint8Array) {
      const self = new IOQueue<T>();
      // oxlint-disable-next-line unicorn/no-new-array
      self.#inner = new Array(input.length + 1);
      for (let i = 0; i < input.length; i++) {
        self.#inner[i] = input[i] as T;
      }
      self.#inner[input.length] = IOQueue.endOfQueue;
      return self;
    } else if (Array.isArray(input)) {
      const self = new IOQueue<T>();
      self.#inner = input.slice();
      self.#inner.push(IOQueue.endOfQueue);
      return self;
    } else {
      throw new TypeError();
    }
  }
}
