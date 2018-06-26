# [@basic-streams](https://github.com/rpominov/basic-streams)/from-loose

<!-- doc -->

```
fromLoose<T>(streamLoose: StreamLoose<T>): Stream<T>
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

The type `StreamLoose` defined as follows, and you can import it from
`@basic-streams/from-loose`.

```
type StreamLoose<T> = (cb: (payload: T, ...rest: any[]) => void) => any

import {StreamLoose} from "@basic-streams/from-loose"
```

<!-- docstop -->
