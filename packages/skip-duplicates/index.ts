import {Stream} from "@basic-streams/stream"

type Maybe<T> = {tag: "nothing"} | {tag: "just"; value: T}

export default function skipDuplicates<T>(
  comp: (prev: T, next: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return sink => {
    let latest: Maybe<T> = {tag: "nothing"}
    return stream(x => {
      if (latest.tag === "nothing" || !comp(latest.value, x)) {
        latest = {tag: "just", value: x}
        sink(x)
      }
    })
  }
}
