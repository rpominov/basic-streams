import {Stream} from "./index"

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

    serialize(
      val: EventsList<any>,
      config: any,
      indentation: string,
      depth: number,
      refs: any,
      printer: (
        x: any,
        config: any,
        indentation: string,
        depth: number,
        refs: any,
      ) => string,
    ) {
      const separator = "\n"
      const itemsStr =
        val.items.length === 0
          ? ""
          : separator +
            val.items
              .map(
                item =>
                  indentation +
                  config.indent +
                  item.time +
                  ": " +
                  printer(
                    item.value,
                    config,
                    indentation + config.indent,
                    depth + 1,
                    refs,
                  ),
              )
              .join(separator) +
            separator
      return `EventsList(${itemsStr})`
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
  let currentTime: number = 0
  let eventsToProduce: EventsList<any> = new EventsList([])
  const resultEvents: Array<Event<T>> = []
  const resultStream = generator((...timeline) => {
    return cb => {
      // wrap cb to make it a unique value that we will compare to in unsuscribe
      const _cb = (x: any) => cb(x)
      eventsToProduce = eventsToProduce.merge(
        EventsList.fromTimeline(timeline, currentTime).withCb(_cb),
      )
      return () => {
        eventsToProduce = new EventsList(
          eventsToProduce.items.filter(item => item.cb !== _cb),
        )
      }
    }
  })
  resultStream(value => {
    resultEvents.push(new Event(currentTime, value))
  })
  while (true) {
    const {event, rest} = eventsToProduce.takeOne()
    if (currentTime >= maxTime || !event) {
      return new EventsList(resultEvents)
    }
    currentTime = event.time
    eventsToProduce = rest
    event.callCb()
  }
}
