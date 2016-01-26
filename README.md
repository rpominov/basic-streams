# basic-streams [![Build Status](https://travis-ci.org/rpominov/basic-streams.svg?branch=master)](https://travis-ci.org/rpominov/basic-streams) [![Coverage Status](https://coveralls.io/repos/rpominov/basic-streams/badge.svg?branch=master&service=github)](https://coveralls.io/github/rpominov/basic-streams?branch=master)

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
import {map} from 'basic-streams'

const myStream = sink => {
  sink(1)
  sink(2)
  // we don't have any allocated resources to dispose in this stream so just return a noop
  return () => {}
}

const myStream2 = map(x => x * 2)(myStream)

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

See [`src/fantasy.js`](https://github.com/rpominov/basic-streams/blob/master/src/fantasy.js)
for docs.

Quick example:

```js
import {Stream} from 'basic-streams/lib/fantasy'

const stream = Stream.of(1).map(x => x * 2)

stream.observe(x => {  console.log(x)  }) // > 2
```

In the UMD build (umd/basicStreams.js), `fantasy` is exposed as `BasicStreams.fantasy`.


## Utils

The package also provides some utilities that you might want to use when
working with main library functionality. Those utils are available as
`basic-streams/lib/utils` for CommonJS module users,
and as `BasicStreams.utils` in the UMD build.

Check [`src/utils.js`](https://github.com/rpominov/basic-streams/blob/master/src/utils.js)
to see what is in there.
