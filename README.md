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
  - [protect](#protect)

<!-- tocstop -->

## Introduction

This is the smallest and the simplest library for event streams (aka
observables). In libraries like RxJS, a stream is an object, with a `subscribe`
or a similar method on it. In these libraries subscribing to a stream looks like
this:

```js
const subscription = stream.subscribe(x => {
  console.log(x)
})

subscription.unsubscribe()
```

In basic-streams, a stream _is_ the `subscribe` function:

```js
const unsubscribe = stream(x => {
  console.log(x)
})

unsubscribe()
```

You don't even need a library to create a stream, you just define a function:

```js
const streamOfMouseMoves = cb => {
  document.addEventListener("mousemove", cb)
  return () => {
    document.removeEventListener("mousemove", cb)
  }
}
```

This library allows you to apply operators like [`map`](#map),
[`filter`](#filter), [`chain`](#chain) (aka `flatMap`) etc. to these streams:

```js
import map from "@basic-streams/map"

const streamOfCoordinates = map(event => {
  return {x: event.clientX, y: event.clientY}
}, streamOfMouseMoves)

streamOfCoordinates(coords => {
  console.log(coords)
})

// > { x: 731, y: 457 }
// > { x: 741, y: 415 }
// > { x: 748, y: 388 }
// > { x: 764, y: 342 }
// > { x: 770, y: 324 }
// > { x: 803, y: 238 }
// > { x: 809, y: 219 }
// > { x: 814, y: 202 }
// > ...
```

## Protocol

```typescript
type Stream<T> = (cb: (event: T) => void) => () => void
```

A valid stream must follow this rules:

1.  Stream is a function.
1.  It accepts one argument, the subscriber function (aka `cb`).
1.  It must return the unsubscribe function (aka `disposer`).
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

The library comes with built-in Flow and TypeScript typings. You don't need to
set up anything it should just work.

If you want to use the `Stream<T>` type in your code, you can import it from
`@basic-streams/stream`:

```js
// TypeScript

import {Stream} from "@basic-streams/stream"
import of from "@basic-streams/of"

const myStream: Stream<number> = of(1)
```

```js
// @flow

import type {Stream} from "@basic-streams/stream"
import of from "@basic-streams/of"

const myStream: Stream<number> = of(1)
```

## How to read time diagrams

In the examples below, you'll see time diagrams like this `___1___2`. They
should be pretty self-explanatory but there are couple notes to make:

- The underscore `_` usually represents one second.
- An event takes space of one underscore, so for example, if an event happens
  after 5 seconds, we add only 4 underscores before it.
- The exclamation mark `!` means that the consumer unsubscribed from the stream.
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

`npm install @basic-streams/of --save`

```typescript
of<T>(value: T): Stream<T>
```

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

`npm install @basic-streams/empty --save`

```typescript
empty(): Stream<never>
```

Creates a stream that will never produce events.

```js
import empty from "@basic-streams/empty"

const stream = empty()

stream(x => {
  console.log(x)
})

// no output
```

<!-- docstop empty -->

<!-- doc later -->

### later

`npm install @basic-streams/later --save`

```typescript
later(time: number): Stream<undefined>
later<T>(time: number, value: T): Stream<T>
```

Creates a stream that will produce a value after the given `time` (in
milliseconds). By default produces `undefined`, but you can pass the `value` in
the second argument.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

const stream = later(5000, 1)

stream(x => {
  console.log(x)
})

// > 1

// stream: ____1
```

<!-- docstop later -->

<!-- doc from-iterable -->

### from-iterable

`npm install @basic-streams/from-iterable --save`

```typescript
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

If an `interval` is provided the events will be spread in time by that ammount
of milliseconds, with the first one delayed. If the interval is `0` the events
will be produced as soon as possible but still asynchronously.

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

Note that the iterable is consumed lazily, meaning that `next()` is called only
when value is needed.

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
an event after the given time. By default [`later`][later] is used as a
scheduler.

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

<!-- docstop from-iterable -->

<!-- doc from-loose -->

### from-loose

`npm install @basic-streams/from-loose --save`

```typescript
fromLoose<T>(streamLoose: StreamLoose<T>): Stream<T>
```

Creates a stream from a loose stream that may not follow all the requirements of
the [protocol]. The loose stream is allowed to:

1.  **Return not a function.** If the return value is not a function, it will be
    ignored.
1.  **Pass more than one argument to the callback.** The resulting stream will
    pass only the first argument to its callback.
1.  **Disposer may return value of any type.** The resulting stream's disposer
    will always return `undefined`.
1.  **Call the callback after disposer was called.** The resulting stream will
    ignore these calls.

```js
import fromLoose from "@basic-streams/from-loose"

const stream = fromLoose(cb => {
  // extra arguments will be ignored
  cb(1, "extra")

  // we don't have to return a function
  return null
})

const unsubscribe = stream((...args) => {
  console.log(...args)
})

unsubscribe()

// > 1
```

The type `StreamLoose` defined as follows, and you can import it from
`@basic-streams/from-loose`.

```typescript
type StreamLoose<T> = (cb: (payload: T, ...rest: any[]) => void) => any

import {StreamLoose} from "@basic-streams/from-loose"
```

<!-- docstop from-loose -->

<!-- doc start-with -->

### start-with

`npm install @basic-streams/start-with --save`

```typescript
startWith<T, U>(x: T, stream: Stream<U>): Stream<T | U>
```

Creates a stream containing values from the given `stream` and `x` as the first
value.

```js
import fromIterable from "@basic-streams/from-iterable"
import startWith from "@basic-streams/start-with"

const stream = fromIterable([1, 2, 3], 5000)

const result = startWith(0, stream)

result(x => {
  console.log(x)
})

// > 0
// > 1
// > 2
// > 3

// stream: ____1____2____3
// result: 0___1____2____3
```

<!-- docstop start-with -->

<!-- doc map -->

### map

`npm install @basic-streams/map --save`

```typescript
map<T, U>(fn: (x: T) => U, stream: Stream<T>): Stream<U>
```

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

<!-- docstop map -->

<!-- doc filter -->

### filter

`npm install @basic-streams/filter --save`

```typescript
filter<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>
```

Creates a stream containing values from the source `stream` that satisfy the
given `predicate`.

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

<!-- docstop filter -->

<!-- doc chain -->

### chain

`npm install @basic-streams/chain --save`

```typescript
chain<T, U>(fn: (x: T) => Stream<U>, stream: Stream<T>): Stream<U>
```

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

<!-- docstop chain -->

<!-- doc chain-latest -->

### chain-latest

`npm install @basic-streams/chain-latest --save`

```typescript
chainLatest<T, U>(fn: (x: T) => Stream<U>, stream: Stream<T>): Stream<U>
```

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

<!-- docstop chain-latest -->

<!-- doc scan -->

### scan

`npm install @basic-streams/scan --save`

```typescript
scan<N, A>(
  reducer: (accumulated: A, next: N) => A,
  seed: A,
  stream: Stream<N>,
): Stream<A>
```

Creates a stream containing `reducer(a, x)` for each value `x` from the source
`stream`, and the latest value `a` produced from by the resulting stream. The
resulting stream will also have given `seed` as the first event.

```js
import fromIterable from "@basic-streams/from-iterable"
import scan from "@basic-streams/scan"

const stream = fromIterable([1, 2, 3], 5000)

const result = scan((acc, next) => acc + next, 0, stream)

result(x => {
  console.log(x)
})

// > 0
// > 1
// > 3
// > 6

// stream: ____1____2____3
// result: 0___1____3____6
```

<!-- docstop scan -->

<!-- doc ap -->

### ap

`npm install @basic-streams/ap --save`

```typescript
ap<T, U>(streamf: Stream<(x: T) => U>, streamv: Stream<T>): Stream<U>
```

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

<!-- docstop ap -->

<!-- doc map2 -->

### map2

`npm install @basic-streams/map2 --save`

```typescript
map2<A, B, C>(
  fn: (a: A, b: B) => C,
  streamA: Stream<A>,
  streamB: Stream<B>,
): Stream<C>
```

Creates a stream containing `fn(a, b)` where `a` and `b` are the latest values
from `streamA` and `streamB`. The resulting stream updates when any of source
stream update.

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

<!-- docstop map2 -->

<!-- doc map3 -->

### map3

`npm install @basic-streams/map3 --save`

```typescript
map3<A, B, C, D>(
  fn: (a: A, b: B, c: C) => D,
  streamA: Stream<A>,
  streamB: Stream<B>,
  streamC: Stream<C>,
): Stream<D>
```

Creates a stream containing `fn(a, b, c)` where `a`, `b` and `c` are the latest
values from `streamA`, `streamB` and `streamC`. The resulting stream updates
when any of source stream update.

```js
import fromIterable from "@basic-streams/from-iterable"
import map3 from "@basic-streams/map3"

const streamA = fromIterable([2, 4], 10000)
const streamB = fromIterable([1, 3], 8000)
const streamC = fromIterable([0], 3000)
const result = map3((a, b, c) => a + b + c, streamA, streamB, streamC)

result(x => {
  console.log(x)
})

// > 3
// > 5
// > 7

// streamA: _________2_________4
// streamB: _______1_______3
// streamC: __0
// result:  _________3_____5___7
```

<!-- docstop map3 -->

<!-- doc combine-array -->

### combine-array

`npm install @basic-streams/combine-array --save`

```typescript
combineArray<T>(streams: Array<Stream<T>>): Stream<Array<T>>
```

Creates a stream containing arrays of the latest values from given `streams`.
The result stream updates when any of source stream updates.

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

<!-- docstop combine-array -->

<!-- doc merge -->

### merge

`npm install @basic-streams/merge --save`

```typescript
merge<T>(streams: Array<Stream<T>>): Stream<T>
```

Creates a stream containing values from all given `streams`.

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

<!-- docstop merge -->

<!-- doc skip -->

### skip

`npm install @basic-streams/skip --save`

```typescript
skip<T>(n: number, stream: Stream<T>): Stream<T>
```

Creates a stream containing values from the given `stream` except for the first
`n` values.

```js
import fromIterable from "@basic-streams/from-iterable"
import skip from "@basic-streams/skip"

const stream = fromIterable([1, 2, 3], 5000)

const result = skip(2, stream)

result(x => {
  console.log(x)
})

// > 3

// stream: ____1____2____3
// result: ______________3
```

<!-- docstop skip -->

<!-- doc skip-while -->

### skip-while

`npm install @basic-streams/skip-while --save`

```typescript
skipWhile<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>
```

Creates a stream containing each value from the given `stream` starting from the
first value `x` for which `predicate(x)` returns false.

```js
import fromIterable from "@basic-streams/from-iterable"
import skipWhile from "@basic-streams/skip-while"

const stream = fromIterable([0, 1, 2, 1], 5000)

const result = skipWhile(x => x < 2, stream)

result(x => {
  console.log(x)
})

// > 2
// > 1

// stream: ____0____1____2____1
// result: ______________2____1
```

<!-- docstop skip-while -->

<!-- doc skip-duplicates -->

### skip-duplicates

`npm install @basic-streams/skip-duplicates --save`

```typescript
skipDuplicates<T>(
  comparator: (previous: T, next: T) => boolean,
  stream: Stream<T>,
): Stream<T>
```

Creates a stream containing each value `x` from the source `stream` if
`comparator(p, x)` returns `false`, where `p` is the latest value produced from
the resulting stream. The first event from source stream isn't tested and always
comes through.

```js
import fromIterable from "@basic-streams/from-iterable"
import skipDuplicates from "@basic-streams/skip-duplicates"

const stream = fromIterable([1, 2, 2, 3], 5000)

const result = skipDuplicates((a, b) => a === b, stream)

result(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// stream: ____1____2____2____3
// result: ____1____2_________3
```

<!-- docstop skip-duplicates -->

<!-- doc take -->

### take

`npm install @basic-streams/take --save`

```typescript
take<T>(n: number, stream: Stream<T>): Stream<T>
```

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

<!-- docstop take -->

<!-- doc take-until -->

### take-until

`npm install @basic-streams/take-until --save`

```typescript
takeUntil<T>(controller: Stream<any>, stream: Stream<T>): Stream<T>
```

Creates a stream containing values from the given `stream` that are produced
before the first event in the `controller` stream.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"
import takeUntil from "@basic-streams/take-until"

const stream = fromIterable([1, 2, 3], 5000)
const controller = later(12000, 0)

const result = takeUntil(controller, stream)

result(x => {
  console.log(x)
})

// > 1
// > 2

// stream:     ____1____2_!
// controller: ___________0!
// result:     ____1____2
```

<!-- docstop take-until -->

<!-- doc take-while -->

### take-while

`npm install @basic-streams/take-while --save`

```typescript
takeWhile<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>
```

Creates a stream containing each value from the given `stream` up until the
first value `x` for which `predicate(x)` returns false.

```js
import fromIterable from "@basic-streams/from-iterable"
import takeWhile from "@basic-streams/take-while"

const stream = fromIterable([0, 1, 2, 1], 5000)

const result = takeWhile(x => x < 2, stream)

result(x => {
  console.log(x)
})

// > 0
// > 1

// stream: ____0____1____2!
// result: ____0____1
```

<!-- docstop take-while -->

<!-- doc multicast -->

### multicast

`npm install @basic-streams/multicast --save`

```typescript
multicast<T>(stream: Stream<T>): Stream<T>
```

Creates a stream with the same events as the given `stream`. The new stream will
have at most one subscription at any given time to the original stream. This
allows you to connect several consumers to a stream.

Each consumer only gets events produced after it was added.

```js
import multicast from "@basic-streams/multicast"

let cb

const stream = _cb => {
  console.log("start")
  cb = _cb
  return () => {
    console.log("stop")
  }
}

const result = multicast(stream)

const unsubscribe1 = result(x => {
  console.log("consumer 1", x)
})

// > "start"

const unsubscribe2 = result(x => {
  console.log("consumer 2", x)
})

// No output this time, because we reuse the previous connection,
// and don't call `stream()` again.

cb(1)

// > "consumer 1" 1
// > "consumer 2" 1

unsubscribe1()

// No output. The connection is still active because
// one consumer is still subscribed.

unsubscribe2()

// > "stop"
```

<!-- docstop multicast -->

<!-- doc protect -->

### protect

`npm install @basic-streams/protect --save`

```typescript
protect<T>(stream: Stream<T>): StreamProtected<T>
```

Creates a protected stream that will contain same events as the given `stream`.
When you use the protected stream, you don't have to follow the following rules
from the [protocol]:

- **Stream must be called with one argument.** You can pass extra arguments.
  They will be ignored.
- **`cb` must always return `undefined`.** Your callback may return value of any
  type.
- **`disposer` must be called with no arguments.** You can pass any arguments to
  the disposer. They will be ignored.
- **`disposer` must be called at most once.** You can call disposer repeatedly.
  The second and following calls will have no effect.

```js
import protect from "@basic-streams/protect"

const stream = (cb, ...extra) => {
  console.log("started", extra)
  console.log("callback returned", cb(1))
  return (...args) => {
    console.log("disposed", args)
  }
}

const result = protect(stream)

const disposer = result(x => {
  console.log("received event", x)
  return "should be ignored"
}, "should be ignored")

// > "started" []
// > "received event" 1
// > "callback returned" undefined

disposer()

// > "disposed" []

disposer()

// no output, the second call is ignored
```

The type `StreamProtected` defined as follows, and you can import it from
`@basic-streams/protect`.

```typescript
type StreamProtected<T> = (
  cb: (payload: T, ...rest: any[]) => void,
  ...rest: any[]
) => (...rest: any[]) => void

import {StreamProtected} from "@basic-streams/protect"
```

<!-- docstop protect -->

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
[protect]: #protect

<!-- linksstop -->

[protocol]: #protocol
