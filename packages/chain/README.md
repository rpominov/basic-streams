# [@basic-streams](https://github.com/rpominov/basic-streams)/chain

<!-- doc -->

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

<!-- docstop -->
