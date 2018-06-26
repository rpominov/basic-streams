# [@basic-streams](https://github.com/rpominov/basic-streams)/protect

<!-- doc -->

`protect<T>(stream: Stream<T>): StreamProtected<T>`

TODO: description

```js
import fromIterable from "@basic-streams/from-iterable"
import protect from "@basic-streams/protect"

const stream = fromIterable([1, 2, 3], 5000)

// TODO: example
const result = stream

result(x => {
  console.log(x)
})

// > TODO: output

// stream: ____1____2____3
```

The type `StreamProtected` defined as follows, and you can import it from
`@basic-streams/protect`.

```js
type StreamProtected<T> = (
  cb: (payload: T, ...rest: any[]) => void,
  ...rest: any[]
) => (...rest: any[]) => void

import {StreamProtected} from "@basic-streams/protect"
```

<!-- docstop -->
