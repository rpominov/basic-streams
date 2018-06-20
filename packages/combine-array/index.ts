import {Stream} from "@basic-streams/stream"
import map2 from "@basic-streams/map2"
import of from "@basic-streams/of"

function append<T>(xs: T[], x: T): T[] {
  return xs.concat([x])
}

function liftedAppend<T>(xs: Stream<T[]>, x: Stream<T>): Stream<T[]> {
  return map2<T[], T, T[]>(append, xs, x)
}

export default function combineArray<T>(
  streams: Array<Stream<T>>,
): Stream<Array<T>> {
  return streams.reduce(liftedAppend, of([]))
}
