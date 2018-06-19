export type Stream<T> = (cb: (payload: T) => void) => (() => void)
export type StreamLoose<T> = (
  cb: (payload: T, ...rest: any[]) => any,
  ...rest: any[]
) => any

type Maybe<T> = {tag: "nothing"} | {tag: "just"; value: T}

function noop() {}

function id<T>(x: T): T {
  return x
}

export function empty(): Stream<any> {
  return emptyStream
}
const emptyStream = () => noop

export function of<T>(x: T): Stream<T> {
  return cb => {
    cb(x)
    return noop
  }
}

export function fromIterable<T>(xs: Iterable<T>): Stream<T> {
  return cb => {
    for (const x of xs) {
      cb(x)
    }
    return noop
  }
}

export function fromLoose<T>(looseStream: StreamLoose<T>): Stream<T> {
  return _cb => {
    let cb: null | ((x: T) => any) = _cb
    let disposer = looseStream(x => {
      if (cb !== null) {
        cb(x)
      }
    })
    return () => {
      if (cb === null) {
        return
      }
      cb = null
      if (typeof disposer === "function") {
        disposer()
      }
      disposer = null
    }
  }
}

export function map<T, U>(fn: (x: T) => U, stream: Stream<T>): Stream<U> {
  return cb => stream(payload => cb(fn(payload)))
}

export function filter<T>(
  predicate: (x: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb =>
    stream(payload => {
      if (predicate(payload)) cb(payload)
    })
}

export function chain<T, U>(
  fn: (x: T) => Stream<U>,
  stream: Stream<T>,
): Stream<U> {
  return cb => {
    let spawnedDisposers: Array<() => void> = []
    const mainDisposer = stream(payload => {
      spawnedDisposers.push(fn(payload)(cb))
    })
    return () => {
      spawnedDisposers.forEach(fn => fn())
      mainDisposer()
    }
  }
}

export function chainLatest<T, U>(
  fn: (x: T) => Stream<U>,
  stream: Stream<T>,
): Stream<U> {
  return cb => {
    let spawnedDisposer = () => {}
    const mainDisposer = stream(payload => {
      spawnedDisposer()
      spawnedDisposer = fn(payload)(cb)
    })
    return () => {
      spawnedDisposer()
      mainDisposer()
    }
  }
}

export function ap<T, U>(
  streamF: Stream<(x: T) => U>,
  streamV: Stream<T>,
): Stream<U> {
  return cb => {
    let latestF: Maybe<(x: T) => U> = {tag: "nothing"}
    let latestV: Maybe<T> = {tag: "nothing"}
    const push = () => {
      if (latestF.tag === "just" && latestV.tag === "just") {
        const fn = latestF.value
        cb(fn(latestV.value))
      }
    }
    const disposef = streamF(f => {
      latestF = {tag: "just", value: f}
      push()
    })
    const disposev = streamV(v => {
      latestV = {tag: "just", value: v}
      push()
    })
    return () => {
      disposef()
      disposev()
    }
  }
}

export function map2<A, B, C>(
  fn: (a: A, b: B) => C,
  streamA: Stream<A>,
  streamB: Stream<B>,
): Stream<C> {
  return ap(map((a: A) => (b: B) => fn(a, b), streamA), streamB)
}

export function map3<A, B, C, D>(
  fn: (a: A, b: B, c: C) => D,
  streamA: Stream<A>,
  streamB: Stream<B>,
  streamC: Stream<C>,
): Stream<D> {
  return ap(
    ap(map((a: A) => (b: B) => (c: C) => fn(a, b, c), streamA), streamB),
    streamC,
  )
}

export function combineArray<T>(streams: Array<Stream<T>>): Stream<Array<T>> {
  return streams.reduce(liftedAppend, of([]))
}
function liftedAppend<T>(xs: Stream<T[]>, x: Stream<T>): Stream<T[]> {
  return map2<T[], T, T[]>(append, xs, x)
}
function append<T>(xs: T[], x: T): T[] {
  return xs.concat([x])
}

export function merge<T>(streams: Array<Stream<T>>): Stream<T> {
  return chain<Stream<T>, T>(id, fromIterable(streams))
}

export function scan<N, A>(
  reducer: (acc: A, next: N) => A,
  seed: A,
  stream: Stream<N>,
): Stream<A> {
  return cb => {
    let acc = seed
    cb(acc)
    return stream(next => {
      acc = reducer(acc, next)
      cb(acc)
    })
  }
}

export function take<T>(n: number, stream: Stream<T>): Stream<T> {
  return cb => {
    let count = 0
    let disposer: (() => void) | null = null
    const dispose = () => {
      if (disposer !== null) {
        disposer()
        disposer = null
      }
    }
    disposer = stream(x => {
      count++
      if (count <= n) {
        cb(x)
      }
      if (count >= n) {
        dispose()
      }
    })
    if (count >= n) {
      dispose()
    }
    return dispose
  }
}

export function takeWhile<T>(
  predicate: (x: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let completed = false
    let disposer: (() => void) | null = null
    const dispose = () => {
      if (disposer !== null) {
        disposer()
        disposer = null
      }
    }
    disposer = stream(x => {
      if (!completed) {
        if (predicate(x)) {
          cb(x)
        } else {
          completed = true
          dispose()
        }
      }
    })
    if (completed) {
      dispose()
    }
    return dispose
  }
}

export function takeUntil<T>(
  controller: Stream<any>,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let disposed = false
    let mainDisposer: (() => void) | null = null
    let ctrlDisposer: (() => void) | null = null
    const dispose = () => {
      if (disposed) {
        return
      }
      disposed = true
      if (mainDisposer !== null) {
        mainDisposer()
        mainDisposer = null
      }
      if (ctrlDisposer !== null) {
        ctrlDisposer()
        ctrlDisposer = null
      }
    }

    ctrlDisposer = controller(dispose)

    if (disposed && ctrlDisposer !== null) {
      ctrlDisposer()
    }

    if (disposed) {
      // subscribe anyway for consistency
      stream(noop)()
    } else {
      mainDisposer = stream(cb)
    }

    return dispose
  }
}

export function skip<T>(n: number, stream: Stream<T>): Stream<T> {
  return cb => {
    let count = 0
    return stream(x => {
      count++
      if (count > n) {
        cb(x)
      }
    })
  }
}

export function skipWhile<T>(
  predicate: (x: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let started = false
    return stream(x => {
      if (!started) {
        started = !predicate(x)
      }
      if (started) {
        cb(x)
      }
    })
  }
}

export function skipDuplicates<T>(
  comp: (prev: T, next: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return sink => {
    let latest: Maybe<T> = {tag: "nothing"}
    return stream(x => {
      if (latest.tag === "nothing" || !comp(latest.value, x)) {
        latest = {tag: "just", value: x}
        sink(x)
      }
    })
  }
}

export function startWith<T, U>(x: T, stream: Stream<U>): Stream<T | U> {
  return cb => {
    cb(x)
    return stream(cb)
  }
}

export function multicast<T>(stream: Stream<T>): Stream<T> {
  let cbs: ((x: T) => void)[] = []
  const push = (x: T) => {
    cbs.forEach(sink => {
      if (cbs.indexOf(sink) !== -1) {
        sink(x)
      }
    })
  }
  let unsub: null | (() => void) = null
  return cb => {
    let disposed = false
    cbs = [...cbs, cb]
    if (cbs.length === 1) {
      unsub = stream(push)
    }
    return () => {
      if (disposed) {
        return
      }
      disposed = true
      const index = cbs.indexOf(cb)
      cbs = [...cbs.slice(0, index), ...cbs.slice(index + 1, cbs.length)]
      if (cbs.length === 0 && unsub !== null) {
        unsub()
        unsub = null
      }
    }
  }
}

/*

TODO:

later
interval
delay
throttle/debounce
sequentially (maybe add optional argument to fromIterable)

*/
