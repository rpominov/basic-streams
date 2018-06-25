# [@basic-streams](https://github.com/rpominov/basic-streams)/skip

<!-- doc -->

`skip<T>(n: number, stream: Stream<T>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import skip from "@basic-streams/skip"

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
