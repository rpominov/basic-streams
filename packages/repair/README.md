# [@basic-streams](https://github.com/rpominov/basic-streams)/repair

<!-- doc -->

```typescript
repair<T>(streamLoose: StreamLoose<T>): Stream<T>
```

Creates a stream from a loose stream that may not follow all the requirements of
the [protocol]. The loose stream is allowed to:

1.  **Return not a function.** If the return value is not a function, it will be
    ignored.
1.  **Pass more than one argument to the callback.** The resulting stream will
    pass only the first argument to its callback.
1.  **Disposer may return value of any type.** The resulting stream's disposer
    will always return `undefined`.
1.  **Call the callback after disposer was called.** The resulting stream will
    ignore these calls.

```js
import repair from "@basic-streams/repair"

const stream = repair(cb => {
  // extra arguments will be ignored
  cb(1, "extra")

  // we don't have to return a function
  return null
})

const unsubscribe = stream((...args) => {
  console.log(...args)
})

unsubscribe()

// > 1
```

The type `StreamLoose` defined as follows, and you can import it from
`@basic-streams/repair`.

```typescript
type StreamLoose<T> = (cb: (payload: T, ...rest: any[]) => void) => any

import {StreamLoose} from "@basic-streams/repair"
```

<!-- docstop -->

[protocol]: https://github.com/rpominov/basic-streams#protocol
