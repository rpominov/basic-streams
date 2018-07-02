# [@basic-streams](https://github.com/rpominov/basic-streams)/take

<!-- doc -->

```typescript
take<T>(n: number, stream: Stream<T>): Stream<T>
```

Creates a stream containing only first `n` events from the source `stream`.

```js
import ofMany from "@basic-streams/of-many"
import take from "@basic-streams/take"

const stream = ofMany([1, 2, 3], 5000)
const result = take(2, stream)

result(x => {
  console.log(x)
})

// > 1
// > 2

// stream: ____1____2!
// result: ____1____2
```

<!-- docstop -->
