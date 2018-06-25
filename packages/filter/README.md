# [@basic-streams](https://github.com/rpominov/basic-streams)/filter

<!-- doc -->

`filter<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>`

Creates a stream containing values from the source `stream` that satisfy the
given `predicate`

```js
import fromIterable from "@basic-streams/from-iterable"
import filter from "@basic-streams/filter"

const stream = fromIterable([1, 2, 3], 5000)
const result = filter(x => x !== 2, stream)

result(x => {
  console.log(x)
})

// > 1
// > 3

// stream: ____1____2____3
// result: ____1_________3
```

<!-- docstop -->
