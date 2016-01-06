# basic-streams [![Build Status](https://travis-ci.org/rpominov/basic-streams.svg?branch=master)](https://travis-ci.org/rpominov/basic-streams)

Experimental very basic reactive streams implementation for JavaScript

## Project status

It's experimental and in a very early stage of development.

## Installation

```
npm install basic-streams
```

Also available on https://npmcdn.com to play in JSFiddle etc.:

 - https://npmcdn.com/basic-streams/umd/basicStreams.js
 - https://npmcdn.com/basic-streams/umd/basicStreams.min.js

## Main idea

The main idea is to take the most basic definition of Stream possible, and build functions to do generic operations with that streams.
In basic-streams Stream is just a function that accepts subscriber and must return function to unsubscribe.

Here is how Stream's type signature looks like:

```js
<T>( sink:( payload:T ) => void ) => () => void
```

The library provides functions like `lift` (aka `map`), `filter`, `chain` (aka `flatMap`) etc. to work with such simple streams.
See `src/index.js` for docs in form of code comments, this is all docs we have for now.

A quick example to get you started:

```js
import {lift} from 'basic-streams'

const myStream = sink => {
  sink(1)
  sink(2)
  // we don't have any allocated resources to dispose in this stream so just return a noop
  return () => {}
}

const myStream2 = lift(x => x * 2)(myStream)

// subscribe
const unsub = myStream2(x => {
  // do stuff with x ...
})

// unsubscribe
unsub()
```




## Fantasy Land wrapper

The library also provides a wrapper that can wrap a basic stream (function)
to an object that exposes methods as
[Fantasy Land Specification](https://github.com/fantasyland/fantasy-land)
requires.

See `src/fantasy.js` for docs.

Quick example:

```js
import {Stream} from 'basic-streams/lib/fantasy'

const stream = Stream.of(1).map(x => x * 2)

stream.observe(x => {  console.log(x)  }) // > 2
```

In the UMD build (umd/basicStreams.js), `fantasy` is exposed as `basicStreams.fantasy`.
