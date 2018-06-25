# [@basic-streams](https://github.com/rpominov/basic-streams)/later

<!-- doc -->

`later<T>(time: number, value?: T): Stream<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

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
