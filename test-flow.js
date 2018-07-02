// @flow

import type {Stream} from "./packages/stream"
import of from "./packages/of"
import empty from "./packages/empty"
import later from "./packages/later"
import ofMany from "./packages/of-many"
import repair from "./packages/repair"
import prepend from "./packages/prepend"
import map from "./packages/map"
import filter from "./packages/filter"
import chain from "./packages/chain"
import chainLatest from "./packages/chain-latest"
import scan from "./packages/scan"
import ap from "./packages/ap"
import map2 from "./packages/map2"
import map3 from "./packages/map3"
import combineArray from "./packages/combine-array"
import merge from "./packages/merge"
import skip from "./packages/skip"
import skipWhile from "./packages/skip-while"
import skipDuplicates from "./packages/skip-duplicates"
import take from "./packages/take"
import takeUntil from "./packages/take-until"
import takeWhile from "./packages/take-while"
import multicast from "./packages/multicast"
import protect from "./packages/protect"

const ofNumber: Stream<number> = cb => {
  cb(1)
  return () => {}
}

function numberToString(n: number): string {
  return n === 0 ? "zero" : "not-zero"
}

function stringToNumber(s: string): number {
  return s.length
}

function numberToBoolean(n: number): boolean {
  return n > 0
}

function stringToBoolean(s: string): boolean {
  return s.length > 0
}

//
// stream
//

type Cat = "cat"
type Dog = "dog"
type Animal = Cat | Dog

const streamOfCat: Stream<Cat> = of("cat")
;(streamOfCat: Stream<Animal>)

//
// of
//
;(of(1): Stream<number>)

// $ExpectError
;(of(""): Stream<number>)

// $ExpectError
;(of(stringToNumber): Stream<(number) => number>)

//
// empty
//
;(empty(): Stream<empty>)

empty()((n: number) => {
  console.log(n)
})

merge([empty(), of(1)])((n: number) => {
  console.log(n)
})

//
// later
//
;(later(1): Stream<void>)
;(later(1, ""): Stream<string>)

//
// of-many
//
;(ofMany([1, 2, 3]): Stream<number>)
;(ofMany([1, 2, 3], 10, later): Stream<number>)

// $ExpectError
;(ofMany([1, 2, 3]): Stream<string>)

//
// repair
//
;(repair(cb => {
  cb(1, "")
  return ""
}): Stream<number>)

//
// prepend
//
;(prepend(1, empty()): Stream<number>)

// $ExpectError
;(prepend(1, empty()): Stream<string>)

//
// map
//
;(map(numberToString, ofNumber): Stream<string>)

// $ExpectError
;(map(numberToString, ofNumber): Stream<number>)

// $ExpectError
map(stringToNumber, ofNumber)

//
// filter
//
;(filter(numberToBoolean, ofNumber): Stream<number>)

// $ExpectError
;(filter(numberToBoolean, ofNumber): Stream<string>)

// $ExpectError
filter(stringToBoolean, ofNumber)

//
// chain
//
;(chain(x => of(numberToString(x)), ofNumber): Stream<string>)

// $ExpectError
;(chain(x => of(numberToString(x)), ofNumber): Stream<number>)

// $ExpectError
chain(x => of(stringToNumber(x)), ofNumber)

//
// chain-latest
//
;(chainLatest(x => of(numberToString(x)), ofNumber): Stream<string>)

// $ExpectError
;(chainLatest(x => of(numberToString(x)), ofNumber): Stream<number>)

// $ExpectError
chainLatest(x => of(stringToNumber(x)), ofNumber)

//
// scan
//
;(scan((s, n) => s, "", ofNumber): Stream<string>)
;(scan((s, n) => numberToString(n), "", ofNumber): Stream<string>)

// $ExpectError
scan((acc, next) => acc.length, "", ofNumber)

// $ExpectError
scan((acc, next) => acc.length, 1, ofNumber)

//
// ap
//
;(ap(of(numberToString), ofNumber): Stream<string>)

// $ExpectError
;(ap(of(numberToString), ofNumber): Stream<number>)

// $ExpectError
ap(of(stringToNumber), ofNumber)

// $ExpectError
ap(of(x => x.length), ofNumber)

// $ExpectError
ap(map(x => y => x + y.length, of(1)), of(1))

//
// map2
//
;(map2((a, b) => a === b, of(1), of(2)): Stream<boolean>)

map2((a, b) => a.length, of(""), of(2))

// $ExpectError
map2((a, b) => a.length, of(1), of(2))

//
// map3
//
;(map3((a, b, c) => a - b === c.length, of(1), of(2), of("")): Stream<boolean>)

map3((a, b, c) => a.length, of(""), of(2), of(null))

// $ExpectError
map3((a, b, c) => a.length, of(1), of(2), of(null))

//
// combine-array
//
;(combineArray([of(1), of("")]): Stream<[number, string]>)

// $ExpectError
;(combineArray([of(1), of("")]): Stream<[boolean, string]>)

const streamsOfNumber: Array<Stream<number>> = []
;(combineArray(streamsOfNumber): Stream<number[]>)

// $ExpectError
;(combineArray(streamsOfNumber): Stream<string[]>)

//
// merge
//
;(merge([of(1), of(2)]): Stream<number>)
;(merge([of(1), of("")]): Stream<number | string>)

// $ExpectError
;(merge([of(1), of(2)]): Stream<string>)

//
// skip
//
;(skip(1, of(1)): Stream<number>)

// $ExpectError
;(skip(1, of(1)): Stream<string>)

//
// skip-while
//
;(skipWhile(numberToBoolean, of(1)): Stream<number>)

// $ExpectError
;(skipWhile(numberToBoolean, of(1)): Stream<string>)

// $ExpectError
skipWhile(numberToBoolean, of(""))

//
// skip-duplicates
//
skipDuplicates((x, y) => x - y === 0, of(1))
;(skipDuplicates((x, y) => x === y, of(1)): Stream<number>)

// $ExpectError
skipDuplicates((x, y) => x - y === 0, of(""))

//
// take
//
;(take(1, of(1)): Stream<number>)

// $ExpectError
;(take(1, of(1)): Stream<string>)

//
// take-until
//
;(takeUntil(of(null), of(1)): Stream<number>)

// $ExpectError
;(takeUntil(of(null), of(1)): Stream<string>)

//
// take-while
//
;(takeWhile(numberToBoolean, of(1)): Stream<number>)

// $ExpectError
;(takeWhile(numberToBoolean, of(1)): Stream<string>)

//
// multicast
//
;(multicast(of(1)): Stream<number>)

// $ExpectError
;(multicast(of(1)): Stream<string>)

//
// protect
//
;(protect(of(1)): Stream<number>)

// $ExpectError
;(protect(of(1)): Stream<string>)

// $ExpectError
of(1)(() => {}, 1)

protect(of(1))(() => {}, 1)

// $ExpectError
of(1)(() => {})(1)

protect(of(1))(() => {})(1)
