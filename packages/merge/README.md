# [@basic-streams](https://github.com/rpominov/basic-streams)/merge

<!-- doc -->

`merge<T>(streams: Array<Stream<T>>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import merge from "@basic-streams/merge"

const stream1 = fromIterable([2, 4, 6], 10000)
const stream2 = fromIterable([1, 3, 5], 8000)
const result = merge([stream1, stream2])

result(x => {
  console.log(x)
})

// > 1
// > 2
// > 3
// > 4
// > 5
// > 6

// stream1: _________2_________4_________6
// stream2: _______1_______3_______5
// result:  _______1_2_____3___4___5_____6
```

<!-- docstop -->
