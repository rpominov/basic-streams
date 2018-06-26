# [@basic-streams](https://github.com/rpominov/basic-streams)/map3

<!-- doc -->

```
map3<A, B, C, D>(
  fn: (a: A, b: B, c: C) => D,
  streamA: Stream<A>,
  streamB: Stream<B>,
  streamC: Stream<C>,
): Stream<D>
```

Creates a stream containing results of applying `fn` to the latest values from
`streamA`, `streamB` and `streamC`. The resulting stream updates when any of
source stream update.

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

<!-- docstop -->
