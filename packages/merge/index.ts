import {Stream} from "@basic-streams/stream"
import ofMany from "@basic-streams/of-many"
import chain from "@basic-streams/chain"

function id<T>(x: T): T {
  return x
}

export default function merge<T>(streams: Array<Stream<T>>): Stream<T> {
  return chain<Stream<T>, T>(id, ofMany(streams))
}
