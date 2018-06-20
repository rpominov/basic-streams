import {Stream} from "@basic-streams/stream"

function noop() {}

export default function fromIterable<T>(xs: Iterable<T>): Stream<T> {
  return cb => {
    for (const x of xs) {
      cb(x)
    }
    return noop
  }
}
