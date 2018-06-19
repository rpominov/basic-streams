import {Stream} from "@basic-streams/stream"

type Maybe<T> = {tag: "nothing"} | {tag: "just"; value: T}

export default function ap<T, U>(
  streamF: Stream<(x: T) => U>,
  streamV: Stream<T>,
): Stream<U> {
  return cb => {
    let latestF: Maybe<(x: T) => U> = {tag: "nothing"}
    let latestV: Maybe<T> = {tag: "nothing"}
    const push = () => {
      if (latestF.tag === "just" && latestV.tag === "just") {
        const fn = latestF.value
        cb(fn(latestV.value))
      }
    }
    const disposef = streamF(f => {
      latestF = {tag: "just", value: f}
      push()
    })
    const disposev = streamV(v => {
      latestV = {tag: "just", value: v}
      push()
    })
    return () => {
      disposef()
      disposev()
    }
  }
}
