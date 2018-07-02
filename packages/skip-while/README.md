# [@basic-streams](https://github.com/rpominov/basic-streams)/skip-while

<!-- doc -->

```typescript
skipWhile<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>
```

Creates a stream containing each value from the given `stream` starting from the
first value `x` for which `predicate(x)` returns false.

```js
import ofMany from "@basic-streams/of-many"
import skipWhile from "@basic-streams/skip-while"

const stream = ofMany([0, 1, 2, 1], 5000)

const result = skipWhile(x => x < 2, stream)

result(x => {
  console.log(x)
})

// > 2
// > 1

// stream: ____0____1____2____1
// result: ______________2____1
```

<!-- docstop -->
