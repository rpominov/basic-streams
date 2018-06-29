# [@basic-streams](https://github.com/rpominov/basic-streams)/start-with

<!-- doc -->

```typescript
startWith<T, U>(x: T, stream: Stream<U>): Stream<T | U>
```

Creates a stream containing values from the given `stream` and `x` as the first
value.

```js
import fromIterable from "@basic-streams/from-iterable"
import startWith from "@basic-streams/start-with"

const stream = fromIterable([1, 2, 3], 5000)

const result = startWith(0, stream)

result(x => {
  console.log(x)
})

// > 0
// > 1
// > 2
// > 3

// stream: ____1____2____3
// result: 0___1____2____3
```

<!-- docstop -->
