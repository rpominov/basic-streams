# [@basic-streams](https://github.com/rpominov/basic-streams)/protect

<!-- doc -->

```typescript
protect<T>(stream: Stream<T>): StreamProtected<T>
```

Creates a protected stream that will contain same events as the given `stream`.
When you use the protected stream, you don't have to follow the following rules
from the [protocol]:

- **Stream must be called with one argument.** You can pass extra arguments.
  They will be ignored.
- **`cb` must always return `undefined`.** Your callback may return value of any
  type.
- **`disposer` must be called with no arguments.** You can pass any arguments to
  the disposer. They will be ignored.
- **`disposer` must be called at most once.** You can call disposer repeatedly.
  The second and following calls will have no effect.

```js
import protect from "@basic-streams/protect"

const stream = (cb, ...extra) => {
  console.log("started", extra)
  console.log("callback returned", cb(1))
  return (...args) => {
    console.log("disposed", args)
  }
}

const result = protect(stream)

const disposer = result(x => {
  console.log("received event", x)
  return "should be ignored"
}, "should be ignored")

// > "started" []
// > "received event" 1
// > "callback returned" undefined

disposer()

// > "disposed" []

disposer()

// no output, the second call is ignored
```

The type `StreamProtected` defined as follows, and you can import it from
`@basic-streams/protect`.

```typescript
type StreamProtected<T> = (
  cb: (payload: T, ...rest: any[]) => void,
  ...rest: any[]
) => (...rest: any[]) => void

import {StreamProtected} from "@basic-streams/protect"
```

<!-- docstop -->

[protocol]: https://github.com/rpominov/basic-streams#protocol
