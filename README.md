# Basic-streams — basic event streams for JavaScript

<!-- toc -->

- [Introduction](#introduction)
- [Protocol](#protocol)
- [Use-cases and limitations](#use-cases-and-limitations)
- [Installation](#installation)
- [Flow and TypeScript](#flow-and-typescript)
- [API reference](#api-reference)
  - [of](#of)
  - [empty](#empty)
  - [later](#later)
  - [from-iterable](#from-iterable)
  - [from-loose](#from-loose)
  - [start-with](#start-with)
  - [map](#map)
  - [filter](#filter)
  - [chain](#chain)
  - [chain-latest](#chain-latest)
  - [scan](#scan)
  - [ap](#ap)
  - [map2](#map2)
  - [map3](#map3)
  - [combine-array](#combine-array)
  - [merge](#merge)
  - [skip](#skip)
  - [skip-while](#skip-while)
  - [skip-duplicates](#skip-duplicates)
  - [take](#take)
  - [take-until](#take-until)
  - [take-while](#take-while)
  - [multicast](#multicast)

<!-- tocstop -->

## Introduction

The idea is to take the most basic definition of event stream and build
functions to do generic operations with that streams. In basic-streams a stream
is just a function that accepts subscriber and must return a function to
unsubscribe.

Here is the type signature of a stream:

```js
<T>(cb: (payload: T) => void) => () => void
```

The library provides functions like [`map`](#map), [`filter`](#filter),
[`chain`](#chain) (aka `flatMap`) etc. to work with such simple streams.

Here is an example:

```js
import map from "@basic-streams/map"

const myStream = cb => {
  cb(1)
  cb(2)

  // we don't have any allocated resources
  // to dispose in this stream so we just return a noop
  return () => {}
}

const myStream2 = map(x => x * 2, myStream)

// subscribe
const unsub = myStream2(x => {
  // do stuff with x ...
})

// unsubscribe
unsub()
```

## Protocol

A valid stream must follow this rules:

1.  Stream is a function.
1.  It accepts one argument, the subscriber function (aka `cb`).
1.  It must return unsubscribe function (aka `disposer`).
1.  `cb` must be called with one argument.
1.  `disposer` must always return `undefined`.
1.  After `disposer` was called, `cb` must not be called.

When you use a stream you must follow this rulles:

1.  Stream must be called with one argument, the `cb`.
1.  `cb` must be a function.
1.  `cb` must always return `undefined`.
1.  `disposer` must be called with no arguments.
1.  `disposer` must be called at most once.

We don't give any guarantees about the library behavior if these rules are
violated. But you can use [`fromLoose`](#from-loose) to create a well-behaved
stream from a loose one, and [`protect`](#protect) if you want to use a stream
more freely.

## Use-cases and limitations

TODO

## Installation

The library consists of many tiny NPM packages, every function is in its own
package. Usually, the name of the package for a function `X` is
`@basic-streams/X`, and the function is the `default` export. For example:

```
npm install @basic-streams/map --save
```

```js
import map from "@basic-streams/map"

// or
const map = require("@basic-streams/map").default
```

## Flow and TypeScript

TODO

## API reference

<!-- doc of -->

### of

`of<T>(value: T): Stream<T>`

Creates a stream that contains the given `value`.

```js
import of from "@basic-streams/of"

const stream = of(1)

stream(x => {
  console.log(x)
})

// > 1
```

<!-- docstop of -->

<!-- doc empty -->

### empty

<!-- docstop empty -->

<!-- doc later -->

### later

<!-- docstop later -->

<!-- doc from-iterable -->

### from-iterable

```
fromIterable<T>(
  iterable: Iterable<T>,
  interval?: number,
  scheduler?: (time: number) => Stream<void>
): Stream<T>
```

Given an `iterable`, returns a stream that produces items from that iterable. If
an `interval` is provided the items will be spread in time. Interval is a number
of milliseconds by which items should be spread. The first item also will be
delayed by that interval. If the interval is `0` the items will be produced as
soon as possible but still asynchronously.

Also, you can provide a custom `scheduler`, a function that creates a stream
that produces an event after a given ammount of milliseconds. By default
[`later`][later] is used as a scheduler.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

//
// simplest case
fromIterable([1, 2, 3])(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

//
// with an interval
fromIterable([1, 2, 3], 10)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// _________1_________2_________3

//
// with a generator function
function* generator() {
  const startTime = Date.now()
  yield Date.now() - startTime
  yield Date.now() - startTime
  yield Date.now() - startTime
}
fromIterable(generator(), 10)(x => {
  console.log(x)
})

// > 0
// > 10
// > 20

//          0         10        20
// _________._________._________.

//
// with a custom scheduler
function scheduler(time) {
  return later(time / 2)
}
fromIterable([1, 2, 3], 10, scheduler)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// ____1____2____3
```

<!-- docstop from-iterable -->

<!-- doc from-loose -->

### from-loose

<!-- docstop from-loose -->

<!-- doc start-with -->

### start-with

<!-- docstop start-with -->

<!-- doc map -->

### map

<!-- docstop map -->

<!-- doc filter -->

### filter

<!-- docstop filter -->

<!-- doc chain -->

### chain

`chain<T, U>(fn: (x: T) => Stream<U>, stream: Stream<T>): Stream<U>`

The given function `fn` will be applied to each value in the given `stream` to
create an intermediate stream. The resulting stream will contain all values from
all intermediate streams.

```js
import fromIterable from "@basic-streams/from-iterable"
import chain from "@basic-streams/chain"

const stream = fromIterable([1, 2], 10)
const fn = x => fromIterable([x, x, x], 7)

const result = chain(fn, stream)

result(x => {
  console.log(x)
})

// > 1
// > 1
// > 2
// > 1
// > 2
// > 2

//
// stream: _________1_________2
// fn(1):            ______1______1______1
// fn(2):                      ______2______2______2
// result: ________________1______1__2___1__2______2
```

<!-- docstop chain -->

<!-- doc chain-latest -->

### chain-latest

<!-- docstop chain-latest -->

<!-- doc scan -->

### scan

<!-- docstop scan -->

<!-- doc ap -->

### ap

`ap<T, U>(streamf: Stream<(x: T) => U>, streamv: Stream<T>): Stream<U>`

Given a stream of functions `streamf` and a stream of values `streamv` returns a
stream that will contain values created by applying the latest function from
`streamf` to the latest value from `streamv` every time one of them updates.

```js
import fromIterable from "@basic-streams/from-iterable"
import ap from "@basic-streams/ap"

const streamf = fromIterable([x => x + 2, x => x - 2], 10)
const streamv = fromIterable([1, 2, 3], 8)

const result = ap(streamf, streamv)

result(x => {
  console.log(x)
})

// > 3
// > 4
// > 0
// > 1

//               x => x + 2   x => x - 2
// streamf: _________._________.
// streamv: _______1_______2_______3
// result:  _________3_____4___0___1
```

<!-- docstop ap -->

<!-- doc map2 -->

### map2

<!-- docstop map2 -->

<!-- doc map3 -->

### map3

<!-- docstop map3 -->

<!-- doc combine-array -->

### combine-array

<!-- docstop combine-array -->

<!-- doc merge -->

### merge

<!-- docstop merge -->

<!-- doc skip -->

### skip

<!-- docstop skip -->

<!-- doc skip-while -->

### skip-while

<!-- docstop skip-while -->

<!-- doc skip-duplicates -->

### skip-duplicates

<!-- docstop skip-duplicates -->

<!-- doc take -->

### take

<!-- docstop take -->

<!-- doc take-until -->

### take-until

<!-- docstop take-until -->

<!-- doc take-while -->

### take-while

<!-- docstop take-while -->

<!-- doc multicast -->

### multicast

<!-- docstop multicast -->

[later]: #later
