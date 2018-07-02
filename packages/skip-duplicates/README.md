# [@basic-streams](https://github.com/rpominov/basic-streams)/skip-duplicates

<!-- doc -->

```typescript
skipDuplicates<T>(
  comparator: (previous: T, next: T) => boolean,
  stream: Stream<T>,
): Stream<T>
```

Creates a stream containing each value `x` from the source `stream` if
`comparator(p, x)` returns `false`, where `p` is the latest value produced from
the resulting stream. The first event from source stream isn't tested and always
comes through.

```js
import ofMany from "@basic-streams/of-many"
import skipDuplicates from "@basic-streams/skip-duplicates"

const stream = ofMany([1, 2, 2, 3], 5000)

const result = skipDuplicates((a, b) => a === b, stream)

result(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// stream: ____1____2____2____3
// result: ____1____2_________3
```

<!-- docstop -->
