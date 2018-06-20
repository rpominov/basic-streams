import {Stream} from "@basic-streams/stream"

export default function take<T>(n: number, stream: Stream<T>): Stream<T> {
  return cb => {
    let count = 0
    let disposer: (() => void) | null = null
    const dispose = () => {
      if (disposer !== null) {
        disposer()
        disposer = null
      }
    }
    disposer = stream(x => {
      count++
      if (count <= n) {
        cb(x)
      }
      if (count >= n) {
        dispose()
      }
    })
    if (count >= n) {
      dispose()
    }
    return dispose
  }
}
