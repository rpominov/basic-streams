# [@basic-streams](https://github.com/rpominov/basic-streams)/from-iterable

<!-- doc -->

```
fromIterable<T>(
  iterable: Iterable<T>,
  interval?: number,
  scheduler?: (time: number) => Stream<void>
): Stream<T>
```

Transforms an `iterable` into a stream.

```js
import fromIterable from "@basic-streams/from-iterable"

fromIterable([1, 2, 3])(x => {
  console.log(x)
})

// > 1
// > 2
// > 3
```

If an `interval` is provided the items will be spread in time by that ammount of
milliseconds, with the first one delayed. If the interval is `0` the items will
be produced as soon as possible but still asynchronously.

```js
import fromIterable from "@basic-streams/from-iterable"

fromIterable([1, 2, 3], 5000)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// ____1____2____3
```

Note that iterable is consumed lazily, meaning that `next()` is called only when
value is needed.

```js
import fromIterable from "@basic-streams/from-iterable"

function* generator() {
  const startTime = Date.now()
  yield Date.now() - startTime
  yield Date.now() - startTime
  yield Date.now() - startTime
}
fromIterable(generator(), 5000)(x => {
  console.log(x)
})

// > 0
// > 5000
// > 10000

//     0   5000  10000
// ____.____.____.
```

You can provide a custom `scheduler`, a function that creates a stream producing
an event after a given time. By default [`later`][later] is used as a scheduler.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

function scheduler(time) {
  return later(time / 2)
}
fromIterable([1, 2, 3], 6000, scheduler)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// __1__2__3
```

<!-- docstop -->

[later]: ../later
