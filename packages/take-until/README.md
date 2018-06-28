# [@basic-streams](https://github.com/rpominov/basic-streams)/take-until

<!-- doc -->

```typescript
takeUntil<T>(controller: Stream<any>, stream: Stream<T>): Stream<T>
```

Creates a stream containing values from the given `stream` that are produced
before the first event in the `controller` stream.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"
import takeUntil from "@basic-streams/take-until"

const stream = fromIterable([1, 2, 3], 5000)
const controller = later(12000, 0)

const result = takeUntil(controller, stream)

result(x => {
  console.log(x)
})

// > 1
// > 2

// stream:     ____1____2_!
// controller: ___________0!
// result:     ____1____2
```

<!-- docstop -->
