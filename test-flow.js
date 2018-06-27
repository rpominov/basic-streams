// @flow

import type {Stream} from "./packages/stream"
import map from "./packages/map"

const stream: Stream<number> = cb => {
  cb(1)
  return () => {}
}

function numberToString(n: number): string {
  return ""
}

function stringToNumber(s: string): number {
  return 0
}

function numberToBoolean(n: number): boolean {
  return false
}

function stringToBoolean(s: string): boolean {
  return false
}

;(map(numberToString, stream): Stream<string>)

// $ExpectError
;(map(numberToString, stream): Stream<number>)

// $ExpectError
map(stringToNumber, stream)
