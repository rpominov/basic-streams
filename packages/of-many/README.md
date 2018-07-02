# [@basic-streams](https://github.com/rpominov/basic-streams)/of-many

<!-- doc -->

```typescript
ofMany<T>(
  values: Iterable<T>,
  interval?: number,
  scheduler?: (time: number) => Stream<void>
): Stream<T>
```

Creates a stream containing given `values`.

```js
import ofMany from "@basic-streams/of-many"

ofMany([1, 2, 3])(x => {
  console.log(x)
})

// > 1
// > 2
// > 3
```

If an `interval` is provided the events will be spread in time by that ammount
of milliseconds, with the first one delayed. If the interval is `0` the events
will be produced as soon as possible but still asynchronously.

```js
import ofMany from "@basic-streams/of-many"

ofMany([1, 2, 3], 5000)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// ____1____2____3
```

Note that the iterable is consumed lazily, meaning that `next()` is called only
when value is needed.

```js
import ofMany from "@basic-streams/of-many"

function* generator() {
  const startTime = Date.now()
  yield Date.now() - startTime
  yield Date.now() - startTime
  yield Date.now() - startTime
}
ofMany(generator(), 5000)(x => {
  console.log(x)
})

// > 0
// > 5000
// > 10000

//     0   5000  10000
// ____.____.____.
```

You can provide a custom `scheduler`, a function that creates a stream producing
an event after the given time. By default [`later`][later] is used as a
scheduler.

```js
import ofMany from "@basic-streams/of-many"
import later from "@basic-streams/later"

function scheduler(time) {
  return later(time / 2)
}
ofMany([1, 2, 3], 6000, scheduler)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// __1__2__3
```

<!-- docstop -->

[later]: https://github.com/rpominov/basic-streams/tree/master/packages/later
