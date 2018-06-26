import {Stream} from "@basic-streams/stream"

interface State<T> {
  cb: (x: T) => any
  disposer?: (() => void)
}

export type StreamProtected<T> = (
  cb: (payload: T, ...rest: any[]) => void,
  ...rest: any[]
) => ((...rest: any[]) => void)

export default function protect<T>(stream: Stream<T>): StreamProtected<T> {
  return cb => {
    let state: null | State<T> = {cb}
    state.disposer = stream(x => {
      if (state !== null) {
        const {cb} = state
        cb(x)
      }
    })
    return () => {
      if (state !== null) {
        const {disposer} = state
        state = null
        disposer()
      }
    }
  }
}
