# [@basic-streams](https://github.com/rpominov/basic-streams)/chain-latest

<!-- doc -->

`chainLatest<T, U>(fn: (x: T) => Stream<U>, stream: Stream<T>): Stream<U>`

Same as [`chain`][chain], but when we create a new intermediate stream, we
unsubscribe from the previous one.

The given function `fn` will be applied to each value in the given `stream` to
create an intermediate stream. The resulting stream will contain values from
each of these streams produced before the next one is created.

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

<!-- docstop -->

[chain]: ../chain
