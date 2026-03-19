function isDenoTest() {
  const sentinel = Symbol("sentinel");
  try {
    Deno.test({
      get name(): string {
        throw sentinel;
      },
      get fn(): () => void {
        throw sentinel;
      },
    });
  } catch (error) {
    if (error === sentinel) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

console.log(isDenoTest());
