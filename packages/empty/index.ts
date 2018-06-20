import {Stream} from "@basic-streams/stream"

function noop() {}

function emptyStream() {
  return noop
}

export default function empty(): Stream<never> {
  return emptyStream
}
