# [@basic-streams](https://github.com/rpominov/basic-streams)/chain-latest

<!-- doc -->

```typescript
chainLatest<T, U>(fn: (x: T) => Stream<U>, stream: Stream<T>): Stream<U>
```

Same as [`chain`][chain], but when we create a new intermediate stream, we
unsubscribe from the previous one.

```js
import ofMany from "@basic-streams/of-many"
import chainLatest from "@basic-streams/chain-latest"

const stream = ofMany([1, 2], 10000)
const fn = x => ofMany([x, x, x], 7000)

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

[chain]: https://github.com/rpominov/basic-streams/tree/master/packages/chain
