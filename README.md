# Legacy `TextEncoder`

🔎 A `TextEncoder` that supports the legacy (non-UTF-8) encodings

## Installation

```sh
npm install @jcbhmr/legacy-text-encoder
```

## Usage

This package exposes

```js
import { LegacyTextEncoder } from "@jcbhmr/legacy-text-encoder";

const encoder = new LegacyTextEncoder("utf-16le");
const bytes = encoder.encode("Hi!");
console.log(bytes);
// Output:
// Uint8Array [ 0x48, 0x00, 0x69, 0x00, 0x21, 0x00 ]
```

```js
import { LegacyTextEncoderStream } from "@jcbhmr/legacy-text-encoder";

const encoder = new LegacyTextEncoderStream("utf-16le");
await ReadableStream.from(["Hi", "!"])
  .pipeThrough(encoder)
  .pipeTo(
    new WritableStream({
      write(chunk) {
        console.log(chunk);
      },
    }),
  );
// Output:
// Uint8Array [ 0x48, 0x00, 0x69, 0x00 ]
// Uint8Array [ 0x21, 0x00 ]
```

## Development

```js
using scalarValues = source[Symbol.iterator]();
const bytes = Uint8Array.from(source.flatMap(encoding.createEncoder()));
```

