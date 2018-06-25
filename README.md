# Basic-streams — basic event streams for JavaScript

<!-- toc -->

- [Introduction](#introduction)
- [Protocol](#protocol)
- [Use-cases](#use-cases)
- [Limitations and alternatives](#limitations-and-alternatives)
- [Installation](#installation)
- [Flow and TypeScript](#flow-and-typescript)
- [How to read time diagrams](#how-to-read-time-diagrams)
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
is just a function that takes a subscriber and returns a function to
unsubscribe. Here is the type signature of a stream:

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

## Use-cases

#### Reactive programming without big dependency

This library can be useful when you want to introduce just a bit of reactive
programming to a project without bringing a big dependency. Sometimes bundle
size is very important and every byte counts, so you may hesitate to add a
library like RxJS as even though streams seem like a perfect solution to a
problem. And here basic-streams come in, it's size almost non-existent, each
function is a separate NPM module, and usually only several lines of code, so it
should never be a problem to add a couple of basic-streams modules as
dependencies.

#### Learning

Another use-case is learning. If you want to learn how reactive programming
libraries work, code of basic-streams should be easier to understand compared to
more serious projects. At the same time, it shares many concepts with them:
you'll find many similar operators, and they work similarly under the hood. But
because streams here is so basic, the code is very simple and there is very
little of it.

#### Why not?

If [limitations](#limitations-and-alternatives) are not important to you why not
use it? It's just another event streams implementation as good as any. The
library is small, fast, well tested and documented, supports Flow and
TypeScript, what else do you need?

## Limitations and alternatives

#### No completion

A stream in basic-streams can't tell its subscriber that it's done producing
events. This makes streams less expressive: if the process behind your stream
has a notion of completion, you can't signal it to the subscriber using
basic-streams. Also, we can't implement certain operators, like
[concat](http://reactivex.io/documentation/operators/concat.html).

In some cases, this can be mitigated by sending a special event at the end, but
because there is no standard way to do it, the library can't offer a good
support for it. For example, you'll still get that special event in `map` and
will have to handle it manually.

We could introduce a standard way to signal completion, but this would make the
library more complex. Simplicity is the main trait of this project, and we have
to pay in expressiveness for it.

#### No errors handling

Similarly to completion, there is no standard way to signal an error using a
stream. This also makes library less expressive and some operators impossible to
implement.

#### No way to unsubscribe from a synchronous stream

If a stream produces several events synchronously you can't unsubscribe after
the first event, because you don't have access to the `unsubscribe` function
yet. For example:

```js
const stream = cb => {
  const items = [1, 2, 3]
  let unsubscribed = false

  // This code doesn't make sense because `unsubscribed`
  // can't be updated until we return the unsubscribe function
  for (let i = 0; i < items.length && !unsubscribed; i++) {
    cb(items[i])
  }

  return () => {
    unsubscribed = true
  }
}

const unsubscribe = stream(x => {
  console.log("first event", x)

  // ReferenceError: can't access lexical declaration `unsubscribe' before initialization
  unsubscribe()
})
```

You can always just ignore events, that is what the [take](#take) operator does.
But this is still a limitation because, for example, we can't implement an
infinite synchronous stream, and then take a finite amount of events from it.

Although in most cases this shouldn't be a problem because streams are supposed
to be asynchronous. If you want to work with synchronous collections you can use
something like Lodash or Ramda.

Note that this issue may exist in the alternatives listed below as well, for
example in Kefir.

#### Alternatives

If basic-streams don't meet your needs, try these more serious projects (in no
particular order):

1.  [Most](https://github.com/cujojs/most)
1.  [Xstream](https://github.com/staltz/xstream)
1.  [RxJS](https://github.com/ReactiveX/rxjs)
1.  [Bacon](https://github.com/baconjs/bacon.js/)
1.  [Kefir](https://github.com/kefirjs/kefir)

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

## How to read time diagrams

In the examples below, you'll see time diagrams like this `___1___2`. They
should be pretty self-explanatory but there are couple notes to make:

The underscore `_` usually represents one second.

An event takes space of one underscore, so for example, if an event happens
after 5 seconds, we add only 4 underscores before it.

When values are more than one character long, we use dots like so:

```js
const stream = fromIterable([100, 200], 5000)

//            100  200
// stream: ____.____.
```

The exclamation mark `!` means that the consumer unsubscribed from the stream.
For example:

```js
const stream = fromIterable([1, 2], 5000)

const unsubscribe = stream(x => {
  unsubscribe()
})

// stream: ____1!
```

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

```sh
npm install @basic-streams/of --save
```

<!-- docstop of -->

<!-- doc empty -->

### empty

`empty(): Stream<never>`

Creates a stream that will never produce events.

```js
import empty from "@basic-streams/empty"

const stream = empty()

stream(x => {
  console.log(x)
})

// no output
```

```sh
npm install @basic-streams/empty --save
```

<!-- docstop empty -->

<!-- doc later -->

### later

`later<T>(time: number, value?: T): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/later --save
```

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

Transforms an `iterable` into a stream.

```js
import fromIterable from "@basic-streams/from-iterable"

fromIterable([1, 2, 3])(x => {
  console.log(x)
})

// > 1
// > 2
// > 3
```

If an `interval` is provided the items will be spread in time by that ammount of
milliseconds, with the first one delayed. If the interval is `0` the items will
be produced as soon as possible but still asynchronously.

```js
import fromIterable from "@basic-streams/from-iterable"

fromIterable([1, 2, 3], 5000)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// ____1____2____3
```

Note that iterable is consumed lazily, meaning that `next()` is called only when
value is needed.

```js
import fromIterable from "@basic-streams/from-iterable"

function* generator() {
  const startTime = Date.now()
  yield Date.now() - startTime
  yield Date.now() - startTime
  yield Date.now() - startTime
}
fromIterable(generator(), 5000)(x => {
  console.log(x)
})

// > 0
// > 5000
// > 10000

//     0   5000  10000
// ____.____.____.
```

You can provide a custom `scheduler`, a function that creates a stream producing
an event after a given time. By default [`later`][later] is used as a scheduler.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

function scheduler(time) {
  return later(time / 2)
}
fromIterable([1, 2, 3], 6000, scheduler)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// __1__2__3
```

```sh
npm install @basic-streams/from-iterable --save
```

<!-- docstop from-iterable -->

<!-- doc from-loose -->

### from-loose

```
fromLoose<T>(
  looseStream: (
    cb: (payload: T, ...rest: any[]) => any,
    ...rest: any[]
  ) => any
): Stream<T>
```

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import fromLoose from "@basic-streams/from-loose"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/from-loose --save
```

<!-- docstop from-loose -->

<!-- doc start-with -->

### start-with

`startWith<T, U>(x: T, stream: Stream<U>): Stream<T | U>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import startWith from "@basic-streams/start-with"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/start-with --save
```

<!-- docstop start-with -->

<!-- doc map -->

### map

`map<T, U>(fn: (x: T) => U, stream: Stream<T>): Stream<U>`

Creates a stream containing `fn(x)` for each value `x` from the source `stream`.

```js
import fromIterable from "@basic-streams/from-iterable"
import map from "@basic-streams/map"

const stream = fromIterable([1, 2, 3], 5000)
const result = map(x => x * 2, stream)

result(x => {
  console.log(x)
})

// > 2
// > 4
// > 6

// stream: ____1____2____3
// result: ____2____4____6
```

```sh
npm install @basic-streams/map --save
```

<!-- docstop map -->

<!-- doc filter -->

### filter

`filter<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>`

Creates a stream containing values from the source `stream` that satisfy the
given `predicate`

```js
import fromIterable from "@basic-streams/from-iterable"
import filter from "@basic-streams/filter"

const stream = fromIterable([1, 2, 3], 5000)
const result = filter(x => x !== 2, stream)

result(x => {
  console.log(x)
})

// > 1
// > 3

// stream: ____1____2____3
// result: ____1_________3
```

```sh
npm install @basic-streams/filter --save
```

<!-- docstop filter -->

<!-- doc chain -->

### chain

`chain<T, U>(fn: (x: T) => Stream<U>, stream: Stream<T>): Stream<U>`

Creates a stream containing all values from all streams created by applying the
given function `fn` to each value in the given `stream`.

```js
import fromIterable from "@basic-streams/from-iterable"
import chain from "@basic-streams/chain"

const stream = fromIterable([1, 2], 10000)
const fn = x => fromIterable([x, x, x], 7000)

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

// stream: _________1_________2
// fn(1):            ______1______1______1
// fn(2):                      ______2______2______2
// result: ________________1______1__2___1__2______2
```

```sh
npm install @basic-streams/chain --save
```

<!-- docstop chain -->

<!-- doc chain-latest -->

### chain-latest

`chainLatest<T, U>(fn: (x: T) => Stream<U>, stream: Stream<T>): Stream<U>`

Same as [`chain`][chain], but when we create a new intermediate stream, we
unsubscribe from the previous one.

```js
import fromIterable from "@basic-streams/from-iterable"
import chainLatest from "@basic-streams/chain-latest"

const stream = fromIterable([1, 2], 10000)
const fn = x => fromIterable([x, x, x], 7000)

const result = chainLatest(fn, stream)

result(x => {
  console.log(x)
})

// > 1
// > 2
// > 2
// > 2

// stream: _________1_________2
// fn(1):            ______1__!
// fn(2):                      ______2______2______2
// result: ________________1_________2______2______2
```

```sh
npm install @basic-streams/chain-latest --save
```

<!-- docstop chain-latest -->

<!-- doc scan -->

### scan

`scan<N, A>(reducer: (acc: A, next: N) => A, seed: A, stream: Stream<N>): Stream<A>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import scan from "@basic-streams/scan"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/scan --save
```

<!-- docstop scan -->

<!-- doc ap -->

### ap

`ap<T, U>(streamf: Stream<(x: T) => U>, streamv: Stream<T>): Stream<U>`

Creates a stream that will contain values created by applying the latest
function from `streamf` to the latest value from `streamv` every time one of
them updates.

```js
import fromIterable from "@basic-streams/from-iterable"
import ap from "@basic-streams/ap"

const streamf = fromIterable([x => x + 2, x => x - 2], 10000)
const streamv = fromIterable([1, 2, 3], 8000)

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

```sh
npm install @basic-streams/ap --save
```

<!-- docstop ap -->

<!-- doc map2 -->

### map2

`map2<A, B, C>(fn: (a: A, b: B) => C, streamA: Stream<A>, streamB: Stream<B>): Stream<C>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import map2 from "@basic-streams/map2"

const streamA = fromIterable([2, 4], 10000)
const streamB = fromIterable([1, 3], 8000)
const result = map2((a, b) => a + b, streamA, streamB)

result(x => {
  console.log(x)
})

// > 3
// > 5
// > 7

// streamA: _________2_________4
// streamB: _______1_______3
// result:  _________3_____5___7
```

```sh
npm install @basic-streams/map2 --save
```

<!-- docstop map2 -->

<!-- doc map3 -->

### map3

```sh
npm install @basic-streams/map3 --save
```

<!-- docstop map3 -->

<!-- doc combine-array -->

### combine-array

`combineArray<T>(streams: Array<Stream<T>>): Stream<Array<T>>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import combineArray from "@basic-streams/combine-array"

const stream1 = fromIterable([2, 4], 10000)
const stream2 = fromIterable([1, 3], 8000)
const result = combineArray([stream1, stream2])

result(x => {
  console.log(x)
})

// > [2, 1]
// > [2, 3]
// > [4, 3]

// stream1: _________2_________4
// stream2: _______1_______3
// result:  _________._____.___.
//              [2, 1] [2, 3] [4, 3]
```

```sh
npm install @basic-streams/combine-array --save
```

<!-- docstop combine-array -->

<!-- doc merge -->

### merge

`merge<T>(streams: Array<Stream<T>>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import merge from "@basic-streams/merge"

const stream1 = fromIterable([2, 4, 6], 10000)
const stream2 = fromIterable([1, 3, 5], 8000)
const result = merge([stream1, stream2])

result(x => {
  console.log(x)
})

// > 1
// > 2
// > 3
// > 4
// > 5
// > 6

// stream1: _________2_________4_________6
// stream2: _______1_______3_______5
// result:  _______1_2_____3___4___5_____6
```

```sh
npm install @basic-streams/merge --save
```

<!-- docstop merge -->

<!-- doc skip -->

### skip

`skip<T>(n: number, stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import skip from "@basic-streams/skip"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/skip --save
```

<!-- docstop skip -->

<!-- doc skip-while -->

### skip-while

`skipWhile<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import skipWhile from "@basic-streams/skip-while"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/skip-while --save
```

<!-- docstop skip-while -->

<!-- doc skip-duplicates -->

### skip-duplicates

`skipDuplicates<T>(comparator: (prev: T, next: T) => boolean, stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import skipDuplicates from "@basic-streams/skip-duplicates"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/skip-duplicates --save
```

<!-- docstop skip-duplicates -->

<!-- doc take -->

### take

`take<T>(n: number, stream: Stream<T>): Stream<T>`

Creates a stream containing only first `n` events from the source `stream`.

```js
import fromIterable from "@basic-streams/from-iterable"
import take from "@basic-streams/take"

const stream = fromIterable([1, 2, 3], 5000)
const result = take(2, stream)

result(x => {
  console.log(x)
})

// > 1
// > 2

// stream: ____1____2!
// result: ____1____2
```

```sh
npm install @basic-streams/take --save
```

<!-- docstop take -->

<!-- doc take-until -->

### take-until

`takeUntil<T>(controller: Stream<any>, stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import takeUntil from "@basic-streams/take-until"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/take-until --save
```

<!-- docstop take-until -->

<!-- doc take-while -->

### take-while

`takeWhile<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import takeWhile from "@basic-streams/take-while"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/take-while --save
```

<!-- docstop take-while -->

<!-- doc multicast -->

### multicast

`multicast<T>(stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import multicast from "@basic-streams/multicast"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

```sh
npm install @basic-streams/multicast --save
```

<!-- docstop multicast -->

<!-- links -->

[of]: #of
[empty]: #empty
[later]: #later
[from-iterable]: #from-iterable
[from-loose]: #from-loose
[start-with]: #start-with
[map]: #map
[filter]: #filter
[chain]: #chain
[chain-latest]: #chain-latest
[scan]: #scan
[ap]: #ap
[map2]: #map2
[map3]: #map3
[combine-array]: #combine-array
[merge]: #merge
[skip]: #skip
[skip-while]: #skip-while
[skip-duplicates]: #skip-duplicates
[take]: #take
[take-until]: #take-until
[take-while]: #take-while
[multicast]: #multicast

<!-- linksstop -->
