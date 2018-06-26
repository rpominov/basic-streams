import {Stream} from "@basic-streams/stream"

export type StreamLoose<T> = (cb: (payload: T, ...rest: any[]) => void) => any

function noop() {}

export default function fromLoose<T>(looseStream: StreamLoose<T>): Stream<T> {
  return cb => {
    let disposer = looseStream(x => cb(x))
    return () => {
      cb = noop
      if (typeof disposer === "function") {
        disposer()
      }
    }
  }
}
