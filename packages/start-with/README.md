# [@basic-streams](https://github.com/rpominov/basic-streams)/start-with

<!-- doc -->

```typescript
startWith<T, U>(x: T, stream: Stream<U>): Stream<T | U>
```

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import startWith from "@basic-streams/start-with"

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
