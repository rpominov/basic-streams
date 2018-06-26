# [@basic-streams](https://github.com/rpominov/basic-streams)/skip

<!-- doc -->

```typescript
skip<T>(n: number, stream: Stream<T>): Stream<T>
```

Creates a stream containing values from the given `stream` except for the first
`n` values.

```js
import fromIterable from "@basic-streams/from-iterable"
import skip from "@basic-streams/skip"

const stream = fromIterable([1, 2, 3], 5000)

const result = skip(2, stream)

result(x => {
  console.log(x)
})

// > 3

// stream: ____1____2____3
// result: ______________3
```

<!-- docstop -->
