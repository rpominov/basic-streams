import {Stream} from "@basic-streams/stream"

function noop() {}

export default function of<T>(x: T): Stream<T> {
  return cb => {
    cb(x)
    return noop
  }
}
