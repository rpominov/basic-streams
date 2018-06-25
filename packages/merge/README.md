# [@basic-streams](https://github.com/rpominov/basic-streams)/merge

<!-- doc -->

`merge<T>(streams: Array<Stream<T>>): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import merge from "@basic-streams/merge"

const stream1 = fromIterable([1, 2, 3], 10000)
const stream2 = fromIterable([4, 5, 6], 8000)
const stream3 = fromIterable([7, 8, 9], 6000)
const result = merge([stream1, stream2, stream3])

result(x => {
  console.log(x)
})

// > 1
// > 2
// > 3
// > 4
// > 5
// > 6
// > 7
// > 8
// > 9

// stream1: _________3_________7_________9
// stream2: _______2_______5_______8
// stream3: _____1_____4_____6
// result:  _____1_2_3_4___5_6_7___8_____9
```

<!-- docstop -->
