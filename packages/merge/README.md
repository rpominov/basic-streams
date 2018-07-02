# [@basic-streams](https://github.com/rpominov/basic-streams)/merge

<!-- doc -->

```typescript
merge<T>(streams: Array<Stream<T>>): Stream<T>
```

Creates a stream containing values from all given `streams`.

```js
import ofMany from "@basic-streams/of-many"
import merge from "@basic-streams/merge"

const stream1 = ofMany([2, 4, 6], 10000)
const stream2 = ofMany([1, 3, 5], 8000)
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
