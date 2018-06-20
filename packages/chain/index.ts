import {Stream} from "@basic-streams/stream"

export default function chain<T, U>(
  fn: (x: T) => Stream<U>,
  stream: Stream<T>,
): Stream<U> {
  return cb => {
    let spawnedDisposers: Array<() => void> = []
    const mainDisposer = stream(payload => {
      spawnedDisposers.push(fn(payload)(cb))
    })
    return () => {
      spawnedDisposers.forEach(fn => fn())
      mainDisposer()
    }
  }
}
