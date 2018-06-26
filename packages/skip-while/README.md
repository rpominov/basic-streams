# [@basic-streams](https://github.com/rpominov/basic-streams)/skip-while

<!-- doc -->

```typescript
skipWhile<T>(predicate: (x: T) => boolean, stream: Stream<T>): Stream<T>
```

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import skipWhile from "@basic-streams/skip-while"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

<!-- docstop -->
