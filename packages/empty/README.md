# [@basic-streams](https://github.com/rpominov/basic-streams)/empty

<!-- doc -->

`empty(): Stream<never>`

Creates a stream that will never produce events.

```js
import empty from "@basic-streams/empty"

const stream = empty()

stream(x => {
  console.log(x)
})

// no output
```

<!-- docstop -->
