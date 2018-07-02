# [@basic-streams](https://github.com/rpominov/basic-streams)/map2

<!-- doc -->

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
import ofMany from "@basic-streams/of-many"
import map2 from "@basic-streams/map2"

const streamA = ofMany([2, 4], 10000)
const streamB = ofMany([1, 3], 8000)
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

<!-- docstop -->
