# [@basic-streams](https://github.com/rpominov/basic-streams)/map

<!-- doc -->

`map<T, U>(fn: (x: T) => U, stream: Stream<T>): Stream<U>`

Creates a stream containing `fn(x)` for each value `x` from the source `stream`.

```js
import fromIterable from "@basic-streams/from-iterable"
import map from "@basic-streams/map"

const stream = fromIterable([1, 2, 3], 5000)
const result = map(x => x * 2, stream)

result(x => {
  console.log(x)
})

// > 2
// > 4
// > 6

// stream: ____1____2____3
// result: ____2____4____6
```

<!-- docstop -->
