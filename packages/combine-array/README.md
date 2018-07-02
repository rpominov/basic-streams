# [@basic-streams](https://github.com/rpominov/basic-streams)/combine-array

<!-- doc -->

```typescript
combineArray<T>(streams: Array<Stream<T>>): Stream<Array<T>>
```

Creates a stream containing arrays of the latest values from given `streams`.
The result stream updates when any of source stream updates.

```js
import ofMany from "@basic-streams/of-many"
import combineArray from "@basic-streams/combine-array"

const stream1 = ofMany([2, 4], 10000)
const stream2 = ofMany([1, 3], 8000)
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
