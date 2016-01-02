# basic-streams [![Build Status](https://travis-ci.org/rpominov/basic-streams.svg?branch=master)](https://travis-ci.org/rpominov/basic-streams)

Experimental very basic reactive streams implementation for JavaScript

## Project status

It's experimental and in a very early stage of development.

## Main idea

Take the most basic defenition of a stream possible, and build functions to do generic operations with taht streams.
In basic-streams Stream is just a function that accepts subscriber and must return function to unsubscribe.
For instance:

```js
const myStream = sink => {
  const el = document.querySelector('#foo')
  el.addEventListener('click', sink)
  return () => {
    el.removeEventListener('click', sink)
  }
}

// subscribe
const unsub = myStream(x => {
  // do stuff with x ...
})

// unsubscribe
unsub()
```

The library provides functions like `lift` (aka `map`), `filter`, `chain` (aka `flatMap`) etc. to work with such simple streams.
See `src/index.js` for docs in form of code comments, this is all docs we have for now.