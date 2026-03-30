import { finished, register, type Encoder as EncoderInterface, "continue" as continue_ } from "./encoding.ts";
import type { Byte, ScalarValue } from "./infra.ts";
import type { ReadableIOQueueScalarValue } from "./io-queue/index.ts";

class Encoder implements EncoderInterface {
  handler(
    input: ReadableIOQueueScalarValue,
    item: ScalarValue | undefined,
  ): finished | Byte | Byte[] | Uint8Array | Error | continue_ {}
}

register({
  name: "x-user-defined",
  labels: ["x-user-defined"],
  Encoder,
});
