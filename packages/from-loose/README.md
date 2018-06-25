# [@basic-streams](https://github.com/rpominov/basic-streams)/from-loose

<!-- doc -->

```
fromLoose<T>(
  looseStream: (
    cb: (payload: T, ...rest: any[]) => any,
    ...rest: any[]
  ) => any
): Stream<T>
```

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import fromLoose from "@basic-streams/from-loose"

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
