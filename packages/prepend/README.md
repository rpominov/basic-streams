# [@basic-streams](https://github.com/rpominov/basic-streams)/prepend

<!-- doc -->

```typescript
prepend<T, U>(x: T, stream: Stream<U>): Stream<T | U>
```

Creates a stream containing values from the given `stream` and `x` as the first
value.

```js
import ofMany from "@basic-streams/of-many"
import prepend from "@basic-streams/prepend"

const stream = ofMany([1, 2, 3], 5000)

const result = prepend(0, stream)

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
