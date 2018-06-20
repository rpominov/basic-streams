# @[basic-streams](https://github.com/rpominov/basic-streams)/of

<!-- api-doc-start -->

### `of<T>(value: T): Stream<T>`

Creates a stream that contains the given **value**.

```js
import of from "@basic-streams/of"

const stream = of(1)

stream(x => {
  console.log(x)
})

// > 1
```

<!-- api-doc-end -->
