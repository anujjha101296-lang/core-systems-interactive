export type Bit = 0 | 1;
export function maskFor(width: number): number {
  if (!Number.isInteger(width) || width < 1 || width > 30) throw new RangeError("width must be an integer from 1 to 30");
  return 2 ** width - 1;
}
export function registerNext(current: number, data: number, width: number, enable: Bit = 1, reset: Bit = 0): number {
  const mask = maskFor(width);
  if (!Number.isInteger(current) || current < 0 || current > mask) throw new RangeError("current must fit the register width");
  if (!Number.isInteger(data) || data < 0 || data > mask) throw new RangeError("data must fit the register width");
  if ((enable !== 0 && enable !== 1) || (reset !== 0 && reset !== 1)) throw new RangeError("enable and reset must be bits");
  if (reset) return 0;
  return enable ? data : current;
}
export function shiftRegisterNext(current: number, serialIn: Bit, width: number, direction: "left" | "right" = "left", enable: Bit = 1, reset: Bit = 0): number {
  const mask = maskFor(width);
  if (!Number.isInteger(current) || current < 0 || current > mask) throw new RangeError("current must fit the register width");
  if (serialIn !== 0 && serialIn !== 1) throw new RangeError("serialIn must be a bit");
  if ((enable !== 0 && enable !== 1) || (reset !== 0 && reset !== 1)) throw new RangeError("enable and reset must be bits");
  if (reset) return 0;
  if (!enable) return current;
  return direction === "left" ? ((current << 1) | serialIn) & mask : (current >>> 1) | (serialIn << (width - 1));
}
export function counterNext(current: number, width: number, direction: "up" | "down" = "up", enable: Bit = 1, reset: Bit = 0): number {
  const mask = maskFor(width);
  if (!Number.isInteger(current) || current < 0 || current > mask) throw new RangeError("current must fit the counter width");
  if ((enable !== 0 && enable !== 1) || (reset !== 0 && reset !== 1)) throw new RangeError("enable and reset must be bits");
  if (reset) return 0;
  if (!enable) return current;
  return direction === "up" ? (current + 1) & mask : (current - 1 + mask + 1) & mask;
}
