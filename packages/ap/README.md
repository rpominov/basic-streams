# [@basic-streams](https://github.com/rpominov/basic-streams)/ap

<!-- doc -->

```typescript
ap<T, U>(streamf: Stream<(x: T) => U>, streamv: Stream<T>): Stream<U>
```

Creates a stream that will contain values created by applying the latest
function from `streamf` to the latest value from `streamv` every time one of
them updates.

<details><summary>Example</summary>

```js
import fromIterable from "@basic-streams/from-iterable"
import ap from "@basic-streams/ap"

const streamf = fromIterable([x => x + 2, x => x - 2], 10000)
const streamv = fromIterable([1, 2, 3], 8000)

const result = ap(streamf, streamv)

result(x => {
  console.log(x)
})

// > 3
// > 4
// > 0
// > 1

//               x => x + 2   x => x - 2
// streamf: _________._________.
// streamv: _______1_______2_______3
// result:  _________3_____4___0___1
```

</details><br/>

<!-- docstop -->
