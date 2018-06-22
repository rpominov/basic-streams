# [@basic-streams](https://github.com/rpominov/basic-streams)/from-iterable

<!-- doc -->

```
fromIterable<T>(
  iterable: Iterable<T>,
  interval?: number,
  scheduler?: (time: number) => Stream<void>
): Stream<T>
```

Given an `iterable`, returns a stream that produces items from that iterable. If
an `interval` is provided the items will be spread in time. Interval is a number
of milliseconds by which items should be spread. The first item also will be
delayed by that interval. If the interval is `0` the items will be produced as
soon as possible but still asynchronously.

Also, you can provide a custom `scheduler`, a function that creates a stream
that produces an event after a given ammount of milliseconds. By default
[`later`][later] is used as a scheduler.

```js
import fromIterable from "@basic-streams/from-iterable"
import later from "@basic-streams/later"

//
// simplest case
fromIterable([1, 2, 3])(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

//
// with an interval
fromIterable([1, 2, 3], 10)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// _________1_________2_________3

//
// with a generator function
function* generator() {
  const startTime = Date.now()
  yield Date.now() - startTime
  yield Date.now() - startTime
  yield Date.now() - startTime
}
fromIterable(generator(), 10)(x => {
  console.log(x)
})

// > 0
// > 10
// > 20

//          0         10        20
// _________._________._________.

//
// with a custom scheduler
function scheduler(time) {
  return later(time / 2)
}
fromIterable([1, 2, 3], 10, scheduler)(x => {
  console.log(x)
})

// > 1
// > 2
// > 3

// ____1____2____3
```

<!-- docstop -->

[later]: ../later
