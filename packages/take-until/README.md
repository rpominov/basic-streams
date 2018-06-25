# [@basic-streams](https://github.com/rpominov/basic-streams)/take-until

<!-- doc -->

`takeUntil<T>(controller: Stream<any>, stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import takeUntil from "@basic-streams/take-until"

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
