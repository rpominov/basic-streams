type Stream<T> = (cb: (payload: T) => void) => (() => void)

export function map<T, U>(fn: (x: T) => U, stream: Stream<T>): Stream<U> {
  return cb => stream(payload => cb(fn(payload)))
}
