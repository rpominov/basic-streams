# basic-streams [![Build Status](https://travis-ci.org/rpominov/basic-streams.svg?branch=master)](https://travis-ci.org/rpominov/basic-streams) [![Coverage Status](https://coveralls.io/repos/rpominov/basic-streams/badge.svg?branch=master&service=github)](https://coveralls.io/github/rpominov/basic-streams?branch=master) [![Gitter](https://badges.gitter.im/pozadi/kefir.svg)](https://gitter.im/pozadi/kefir?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Experimental very basic reactive streams implementation for JavaScript

## Project status

It's experimental but somewhat stable and well tested.
You can use it if you find it usable, I did't use it myself though.<br/>
The minor (middle) number of version is incremented when breaking changes are made.

## Installation

```
npm install basic-streams
```

Also available on https://npmcdn.com to play in JSFiddle etc.:

 - https://npmcdn.com/basic-streams/umd/basicStreams.js
 - https://npmcdn.com/basic-streams/umd/basicStreams.min.js

## Main idea

The main idea is to take the most basic definition of Stream possible, and
build functions to do generic operations with that streams.
In basic-streams Stream is just a function that accepts subscriber and must
return function to unsubscribe.

Here is how Stream's type signature looks like:

```js
<T>( sink:( payload:T ) => void ) => () => void
```

The library provides functions like `map`, `filter`, `chain`
(aka `flatMap`) etc. to work with such simple streams.
See [`src/index.js`](https://github.com/rpominov/basic-streams/blob/master/src/index.js)
for docs in form of code comments, this is all docs we have for now.

A quick example to get you started:

```js
import {Stream} from 'basic-streams'

const myStream = sink => {
  sink(1)
  sink(2)
  // we don't have any allocated resources to dispose in this stream so just return a noop
  return () => {}
}

const myStream2 = Stream.map(x => x * 2, myStream)

// subscribe
const unsub = myStream2(x => {
  // do stuff with x ...
})

// unsubscribe
unsub()
```

## Examples

 - [Morse code](https://jsfiddle.net/y94qt2aq/)
 - [Reduce without built in completion](https://jsfiddle.net/sp6mj2ng/)


## Basic-streams protocol

A valid Stream must obey the following rules:

1. Stream is a function
1. It accepts one argument, the subscriber function (aka `sink`)
1. It must return unsubscribe function (aka `disposer`)
1. `sink` must be called with one argument
1. `disposer` must always return `undefined`
1. After `disposer` was called, `sink` must not be called

When a Stream is used the following rules must be obeyed:

1. `stream` must be called with one argument, `sink`
1. `sink` must be a function
1. `sink` must always return `undefined`
1. `disposer` must be called with no arguments
1. `disposer` must be called at most once

If an invalid Stream is used with this library, behavior is undefined.


## Fantasy Land wrapper

The library also provides a wrapper that can wrap a basic stream (function)
to an object that exposes methods as
[Fantasy Land Specification](https://github.com/fantasyland/fantasy-land)
requires.

See [`src/fantasy.js`](https://github.com/rpominov/basic-streams/blob/master/src/fantasy.js)
for docs.

Quick example:

```js
import {FantasyStream} from 'basic-streams'

const stream = FantasyStream.of(1).map(x => x * 2)

stream.observe(x => {  console.log(x)  }) // > 2
```


## Development

```
npm run lobot -- --help
```

Run [lobot](https://github.com/rpominov/lobot) commands as `npm run lobot -- args...`
