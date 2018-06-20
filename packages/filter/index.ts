import {Stream} from "@basic-streams/stream"

export default function filter<T>(
  predicate: (x: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb =>
    stream(payload => {
      if (predicate(payload)) cb(payload)
    })
}
