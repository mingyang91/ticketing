export async function retry<T>(time: number, f: () => Promise<T>): Promise<T> {
  if (time === 1) {
    return f();
  } else {
    try {
      const res = await f();
      return res;
    } catch (_) {
      return retry(time - 1, f);
    }
  }
}
