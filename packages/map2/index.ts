import {Stream} from "@basic-streams/stream"
import map from "@basic-streams/map"
import ap from "@basic-streams/ap"

export default function map2<A, B, C>(
  fn: (a: A, b: B) => C,
  streamA: Stream<A>,
  streamB: Stream<B>,
): Stream<C> {
  return ap(map((a: A) => (b: B) => fn(a, b), streamA), streamB)
}
