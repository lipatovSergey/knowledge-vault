import { randomBytes } from "node:crypto";
import { promisify } from "node:util";
// make promise from callback
const randomBytesAsync = promisify(randomBytes);

export async function random(len: number) {
  return await randomBytesAsync(len);
}

export type RandomUtilType = typeof random;
