# [@basic-streams](https://github.com/rpominov/basic-streams)/scan

<!-- doc -->

```typescript
scan<N, A>(
  reducer: (accumulated: A, next: N) => A,
  seed: A,
  stream: Stream<N>,
): Stream<A>
```

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import scan from "@basic-streams/scan"

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
