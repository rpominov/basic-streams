// @flow

import type {Stream} from "./packages/stream"
import of from "./packages/of"
import empty from "./packages/empty"
import later from "./packages/later"
import fromIterable from "./packages/from-iterable"
import fromLoose from "./packages/from-loose"
import startWith from "./packages/start-with"
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

// TODO

//
// later
//

// TODO

//
// from-iterable
//

// TODO

//
// from-loose
//

// TODO

//
// start-with
//

// TODO

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

// TODO

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

// TODO

//
// scan
//

// TODO

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

// TODO

//
// map3
//

// TODO

//
// combine-array
//

// TODO

//
// merge
//

// TODO

//
// skip
//

// TODO

//
// skip-while
//

// TODO

//
// skip-duplicates
//

// TODO

//
// take
//

// TODO

//
// take-until
//

// TODO

//
// take-while
//

// TODO

//
// multicast
//

// TODO

//
// protect
//

// TODO
