import {Stream} from "@basic-streams/stream"

export default function takeWhile<T>(
  predicate: (x: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let completed = false
    let disposer: (() => void) | null = null
    const dispose = () => {
      if (disposer !== null) {
        disposer()
        disposer = null
      }
    }
    disposer = stream(x => {
      if (!completed) {
        if (predicate(x)) {
          cb(x)
        } else {
          completed = true
          dispose()
        }
      }
    })
    if (completed) {
      dispose()
    }
    return dispose
  }
}
