import {Stream} from "@basic-streams/stream"

export default function scan<N, A>(
  reducer: (acc: A, next: N) => A,
  seed: A,
  stream: Stream<N>,
): Stream<A> {
  return cb => {
    let acc = seed
    cb(acc)
    return stream(next => {
      acc = reducer(acc, next)
      cb(acc)
    })
  }
}
