import {Stream} from "@basic-streams/stream"

export default function map<T, U>(
  fn: (x: T) => U,
  stream: Stream<T>,
): Stream<U> {
  return cb => stream(payload => cb(fn(payload)))
}
