import {Stream} from "@basic-streams/stream"

export default function skipWhile<T>(
  predicate: (x: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let started = false
    return stream(x => {
      if (!started) {
        started = !predicate(x)
      }
      if (started) {
        cb(x)
      }
    })
  }
}
