# [@basic-streams](https://github.com/rpominov/basic-streams)/ap

<!-- api-doc-start -->

### `ap<T, U>(streamf: Stream<(x: T) => U>, stream: Stream<T>): Stream<U>`

Given a stream of functions `streamf` and a stream of values `streamv` returns a
stream that will contain values created by applying the latest function from
`streamf` to the latest value from `streamv` every time one of them updates.

```js
import of from "@basic-streams/of"
import ap from "@basic-streams/ap"

const stream = ap(of(x => x * 2), of(10))

stream(x => {
  console.log(x)
})

// > 20
```

<!-- api-doc-end -->
