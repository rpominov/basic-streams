import {Stream} from "@basic-streams/stream"

export default function skip<T>(n: number, stream: Stream<T>): Stream<T> {
  return cb => {
    let count = 0
    return stream(x => {
      count++
      if (count > n) {
        cb(x)
      }
    })
  }
}
