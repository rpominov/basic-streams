import {Stream} from "@basic-streams/stream"

export default function chainLatest<T, U>(
  fn: (x: T) => Stream<U>,
  stream: Stream<T>,
): Stream<U> {
  return cb => {
    let spawnedDisposer = () => {}
    const mainDisposer = stream(payload => {
      spawnedDisposer()
      spawnedDisposer = fn(payload)(cb)
    })
    return () => {
      spawnedDisposer()
      mainDisposer()
    }
  }
}
