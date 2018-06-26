import {Stream} from "@basic-streams/stream"

export default function later(time: number): Stream<undefined>
export default function later<T>(time: number, value: T): Stream<T>
export default function later<T>(time: number, value?: T): Stream<T> {
  return cb => {
    const timeoutid = setTimeout(
      value === undefined
        ? cb
        : () => {
            cb(value)
          },
      time,
    )
    return () => {
      clearTimeout(timeoutid)
    }
  }
}
