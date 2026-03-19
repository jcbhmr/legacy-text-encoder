import { register } from "./encoding.ts";

class Encoder {
  isGBK: boolean = false;
  handler(_unused: unknown, codePoint: number) {}
}

register({
  name: "gb18030",
  labels: [],
  encoder: Encoder,
});
