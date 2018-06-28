import {Stream} from "@basic-streams/stream"

export type StreamLoose<T> = (cb: (payload: T, ...rest: any[]) => void) => any

function noop() {}

export default function fromLoose<T>(streamLoose: StreamLoose<T>): Stream<T> {
  return cb => {
    let disposer = streamLoose(x => cb(x))
    return () => {
      cb = noop
      if (typeof disposer === "function") {
        disposer()
      }
    }
  }
}
