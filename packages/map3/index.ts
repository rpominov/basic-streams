import {Stream} from "@basic-streams/stream"
import map from "@basic-streams/map"
import ap from "@basic-streams/ap"

export default function map3<A, B, C, D>(
  fn: (a: A, b: B, c: C) => D,
  streamA: Stream<A>,
  streamB: Stream<B>,
  streamC: Stream<C>,
): Stream<D> {
  return ap(
    ap(map((a: A) => (b: B) => (c: C) => fn(a, b, c), streamA), streamB),
    streamC,
  )
}
