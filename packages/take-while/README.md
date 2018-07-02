# [@basic-streams](https://github.com/rpominov/basic-streams)/take-while

<!-- doc -->

```typescript
takeWhile<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>
```

Creates a stream containing each value from the given `stream` up until the
first value `x` for which `predicate(x)` returns false.

```js
import ofMany from "@basic-streams/of-many"
import takeWhile from "@basic-streams/take-while"

const stream = ofMany([0, 1, 2, 1], 5000)

const result = takeWhile(x => x < 2, stream)

result(x => {
  console.log(x)
})

// > 0
// > 1

// stream: ____0____1____2!
// result: ____0____1
```

<!-- docstop -->
