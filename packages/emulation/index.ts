import {Stream} from "@basic-streams/stream"

export class Value<T> {
  constructor(public readonly value: T) {}
}

export class TimeSpan {
  constructor(public readonly ms: number) {}
}

export type Timeline<T> = Array<TimeSpan | Value<T>>

export class Event<T> {
  constructor(
    public readonly time: number,
    public readonly value: T,
    public readonly cb?: ((x: T) => void),
  ) {}

  callCb() {
    if (this.cb) {
      this.cb(this.value)
    }
  }
}

export class EventsList<T> {
  constructor(public readonly items: Array<Event<T>>) {}

  static fromTimeline<T>(items: Timeline<T>, currentTime = 0): EventsList<T> {
    const events: Array<Event<T>> = []
    for (const item of items) {
      if (item instanceof TimeSpan) {
        currentTime = currentTime + item.ms
      } else {
        events.push(new Event(currentTime, item.value))
      }
    }
    return new EventsList(events)
  }

  withCb(cb: (value: T) => void): EventsList<T> {
    return new EventsList(
      this.items.map(item => new Event(item.time, item.value, cb)),
    )
  }

  merge(another: EventsList<T>): EventsList<T> {
    const events: Array<Event<T>> = []
    let indexA = 0
    let indexB = 0
    const itemsA = this.items
    const itemsB = another.items
    while (itemsA.length > indexA || itemsB.length > indexB) {
      if (
        itemsA.length !== indexA &&
        (itemsB.length === indexB || itemsA[indexA].time <= itemsB[indexB].time)
      ) {
        events.push(itemsA[indexA])
        indexA++
      } else {
        events.push(itemsB[indexB])
        indexB++
      }
    }
    return new EventsList(events)
  }

  takeOne(): {event: Event<T> | void; rest: EventsList<T>} {
    const [event, ...rest] = this.items
    return {event, rest: new EventsList(rest)}
  }

  toJSON() {
    return this.items.map(item => ({time: item.time, value: item.value}))
  }

  static jestSerializer = {
    test(x: any) {
      return x instanceof EventsList
    },

    // for outdated TS typings
    print(x: any): string {
      return ""
    },

    serialize<Refs, Config extends {indent: string}, T>(
      val: EventsList<T>,
      config: Config,
      indentation: string,
      depth: number,
      refs: Refs,
      printer: (
        x: T,
        config: Config,
        indentation: string,
        depth: number,
        refs: Refs,
      ) => string,
    ) {
      const separator = "\n"

      function printItem(item: Event<T>) {
        const indentation1 = indentation + config.indent
        const value = printer(item.value, config, indentation1, depth + 1, refs)
        return indentation1 + item.time + ": " + value
      }

      return `EventsList(${
        val.items.length === 0
          ? ""
          : separator + val.items.map(printItem).join(separator) + separator
      })`
    },
  }
}

export function t(ms: number): TimeSpan {
  return new TimeSpan(ms)
}

export function v<T>(x: T): Value<T> {
  return new Value(x)
}

export function emulate<T>(
  generator: (
    createStream: <U>(...timeline: Timeline<U>) => Stream<U>,
  ) => Stream<T>,
  maxTime = Infinity,
): EventsList<T> {
  const state = {
    time: 0,
    toProduce: new EventsList([]) as EventsList<any>,
    result: [] as Array<Event<T>>,
  }
  const resultStream = generator((...timeline) => {
    return cb => {
      // wrapping cb to make it a unique value
      // that we will compare to in unsuscribe
      const _cb = (x: any) => cb(x)
      state.toProduce = state.toProduce.merge(
        EventsList.fromTimeline(timeline, state.time).withCb(_cb),
      )
      return () => {
        state.toProduce = new EventsList(
          state.toProduce.items.filter(item => item.cb !== _cb),
        )
      }
    }
  })
  resultStream(value => {
    state.result.push(new Event(state.time, value))
  })
  while (true) {
    const {event, rest} = state.toProduce.takeOne()
    if (state.time >= maxTime || !event) {
      return new EventsList(state.result)
    }
    state.time = event.time
    state.toProduce = rest
    event.callCb()
  }
}

export function laterMock(
  createStream: <U>(...timeline: Timeline<U>) => Stream<U>,
) {
  return function later<T>(time: number, value?: T): Stream<T> {
    return createStream(t(time), v(value as any))
  }
}
