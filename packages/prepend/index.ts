import {Stream} from "@basic-streams/stream"

export default function prepend<T, U>(x: T, stream: Stream<U>): Stream<T | U> {
  return cb => {
    cb(x)
    return stream(cb)
  }
}
