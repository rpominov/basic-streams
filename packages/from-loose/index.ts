import {Stream} from "@basic-streams/stream"

export type StreamLoose<T> = (
  cb: (payload: T, ...rest: any[]) => any,
  ...rest: any[]
) => any

export default function fromLoose<T>(looseStream: StreamLoose<T>): Stream<T> {
  return _cb => {
    let cb: null | ((x: T) => any) = _cb
    let disposer = looseStream(x => {
      if (cb !== null) {
        cb(x)
      }
    })
    return () => {
      if (cb === null) {
        return
      }
      cb = null
      if (typeof disposer === "function") {
        disposer()
      }
      disposer = null
    }
  }
}
