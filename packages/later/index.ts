import {Stream} from "@basic-streams/stream"

export default function later(time: number): Stream<undefined> {
  return cb => {
    const timeoutid = setTimeout(cb, time)
    return () => {
      clearTimeout(timeoutid)
    }
  }
}
