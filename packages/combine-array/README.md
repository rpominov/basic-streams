# [@basic-streams](https://github.com/rpominov/basic-streams)/combine-array

<!-- doc -->

`combineArray<T>(streams: Array<Stream<T>>): Stream<Array<T>>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import combineArray from "@basic-streams/combine-array"

const stream1 = fromIterable([2, 4], 10000)
const stream2 = fromIterable([1, 3], 8000)
const result = combineArray([stream1, stream2])

result(x => {
  console.log(x)
})

// > [2, 1]
// > [2, 3]
// > [4, 3]

// stream1: _________2_________4
// stream2: _______1_______3
// result:  _________._____.___.
//              [2, 1] [2, 3] [4, 3]
```

<!-- docstop -->
