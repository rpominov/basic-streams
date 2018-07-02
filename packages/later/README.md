# [@basic-streams](https://github.com/rpominov/basic-streams)/later

<!-- doc -->

```typescript
later(time: number): Stream<undefined>
```

Creates a stream that will produce `undefined` after the given `time` in
milliseconds.

```js
import ofMany from "@basic-streams/of-many"
import later from "@basic-streams/later"

const stream = later(5000)

stream(x => {
  console.log(x)
})

// > undefined

//           undefined
// stream: ____.
```

<!-- docstop -->
