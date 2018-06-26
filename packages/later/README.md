# [@basic-streams](https://github.com/rpominov/basic-streams)/later

<!-- doc -->

```typescript
later(time: number): Stream<undefined>
later<T>(time: number, value: T): Stream<T>
```

Creates a stream that will produce a value after the given `time` (in
milliseconds). By default produces `undefined`, but you can pass the `value` in
the second argument.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

const stream = later(5000, 1)

stream(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1
```

<!-- docstop -->
