import {Stream} from "@basic-streams/stream"

type Maybe<T> = null | {value: T}

export default function skipDuplicates<T>(
  comp: (prev: T, next: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let latest: Maybe<T> = null
    return stream(x => {
      if (!latest || !comp(latest.value, x)) {
        latest = {value: x}
        cb(x)
      }
    })
  }
}
