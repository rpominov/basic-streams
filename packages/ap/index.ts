import {Stream} from "@basic-streams/stream"

type Maybe<T> = null | {value: T}

export default function ap<T, U>(
  streamF: Stream<(x: T) => U>,
  streamV: Stream<T>,
): Stream<U> {
  return cb => {
    let latestF: Maybe<(x: T) => U> = null
    let latestV: Maybe<T> = null
    const push = () => {
      if (latestF && latestV) {
        const fn = latestF.value
        cb(fn(latestV.value))
      }
    }
    const disposef = streamF(f => {
      latestF = {value: f}
      push()
    })
    const disposev = streamV(v => {
      latestV = {value: v}
      push()
    })
    return () => {
      disposef()
      disposev()
    }
  }
}
