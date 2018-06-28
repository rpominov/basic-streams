# [@basic-streams](https://github.com/rpominov/basic-streams)/scan

<!-- doc -->

```typescript
scan<N, A>(
  reducer: (accumulated: A, next: N) => A,
  seed: A,
  stream: Stream<N>,
): Stream<A>
```

Creates a stream containing `reducer(a, x)` for each value `x` from the source
`stream`, and the latest value `a` produced from by the resulting stream. The
resulting stream will also have given `seed` as the first event.

```js
import fromIterable from "@basic-streams/from-iterable"
import scan from "@basic-streams/scan"

const stream = fromIterable([1, 2, 3], 5000)

const result = scan((acc, next) => acc + next, 0, stream)

result(x => {
  console.log(x)
})

// > 0
// > 1
// > 3
// > 6

// stream: ____1____2____3
// result: 0___1____3____6
```

<!-- docstop -->
