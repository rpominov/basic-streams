# [@basic-streams](https://github.com/rpominov/basic-streams)/multicast

<!-- doc -->

```typescript
multicast<T>(stream: Stream<T>): Stream<T>
```

Creates a stream with the same events as the given `stream`. The new stream will
have at most one subscription at any given time to the original stream. This
allows you to connect several consumers to a stream.

Each consumer only gets events produced after it was added.

```js
import multicast from "@basic-streams/multicast"

let cb

const stream = _cb => {
  console.log("start")
  cb = _cb
  return () => {
    console.log("stop")
  }
}

const result = multicast(stream)

const unsubscribe1 = result(x => {
  console.log("consumer 1", x)
})

// > "start"

const unsubscribe2 = result(x => {
  console.log("consumer 2", x)
})

// No output this time, because we reuse the previous connection,
// and don't call `stream()` again.

cb(1)

// > "consumer 1" 1
// > "consumer 2" 1

unsubscribe1()

// No output. The connection is still active because
// one consumer is still subscribed.

unsubscribe2()

// > "stop"
```

<!-- docstop -->
