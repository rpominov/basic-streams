import {Stream} from "@basic-streams/stream"

export default function multicast<T>(stream: Stream<T>): Stream<T> {
  let cbs: ((x: T) => void)[] = []
  const push = (x: T) => {
    cbs.forEach(sink => {
      if (cbs.indexOf(sink) !== -1) {
        sink(x)
      }
    })
  }
  let unsub: null | (() => void) = null
  return cb => {
    let disposed = false
    cbs = [...cbs, cb]
    if (cbs.length === 1) {
      unsub = stream(push)
    }
    return () => {
      if (disposed) {
        return
      }
      disposed = true
      const index = cbs.indexOf(cb)
      cbs = [...cbs.slice(0, index), ...cbs.slice(index + 1, cbs.length)]
      if (cbs.length === 0 && unsub !== null) {
        unsub()
        unsub = null
      }
    }
  }
}
