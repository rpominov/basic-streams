export class Value<T> {
  constructor(
    public readonly value: T,
    public readonly cb?: ((x: T) => void),
  ) {}

  callCb() {
    if (this.cb) {
      this.cb(this.value)
    }
  }

  toJSON() {
    return this.value
  }
}

export class TimeSpan {
  constructor(public readonly ms: number) {}

  toJSON() {
    return `...after ${this.ms} ms`
  }
}

type ScheduleItem<T> = TimeSpan | Value<T>

export class Schedule<T> {
  constructor(
    public readonly items: ReadonlyArray<ScheduleItem<T>>,
    dontCompact?: boolean,
  ) {
    if (dontCompact) {
      return this
    }

    const finalItems: Array<ScheduleItem<T>> = []
    for (const item of this.items) {
      if (item instanceof TimeSpan) {
        if (item.ms === 0) {
          continue
        }
        if (finalItems.length > 0) {
          const last = finalItems[finalItems.length - 1]
          if (last instanceof TimeSpan) {
            finalItems[finalItems.length - 1] = new TimeSpan(last.ms + item.ms)
            continue
          }
        }
      }
      finalItems.push(item)
    }

    if (
      finalItems.length > 0 &&
      finalItems[finalItems.length - 1] instanceof TimeSpan
    ) {
      finalItems.pop()
    }

    return new Schedule(finalItems, true)
  }

  withCb(cb: (value: T) => void): Schedule<T> {
    return new Schedule(
      this.items.map(
        item => (item instanceof TimeSpan ? item : new Value(item.value, cb)),
      ),
    )
  }

  merge<U>(
    another: Schedule<U>,
    result: Schedule<T | U> = new Schedule([]),
  ): Schedule<T | U> {
    const a = this
    const b = another
    if (a.items.length === 0 && b.items.length === 0) {
      return result
    }
    if (a.items.length === 0) {
      return new Schedule([
        ...result.items,
        ...(b.items as Array<ScheduleItem<T | U>>),
      ])
    }
    if (b.items.length === 0) {
      return new Schedule([
        ...result.items,
        ...(a.items as Array<ScheduleItem<T | U>>),
      ])
    }
    const timeToValueA = a.timeToValue()
    const timeToValueB = b.timeToValue()
    if (timeToValueA === Infinity && timeToValueB === Infinity) {
      return new Schedule([
        new TimeSpan(Math.max(a.timeToEnd(), b.timeToEnd())),
        ...result.items,
      ])
    }
    const timeToValue = Math.min(timeToValueA, timeToValueB)
    const subtractA = a.subtractTime(timeToValue)
    const subtractB = b.subtractTime(timeToValue)
    return subtractA.rest.merge(
      subtractB.rest,
      new Schedule([
        ...result.items,
        new TimeSpan(timeToValue),
        ...(subtractA.values as Array<Value<T | U>>),
        ...(subtractB.values as Array<Value<T | U>>),
      ]),
    )
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  takeOne(): {item: ScheduleItem<T>; rest: Schedule<T>} {
    if (this.isEmpty()) {
      throw new Error("cannot takeOne() from an empty schedule")
    }
    const [top, ...rest] = this.items
    return {item: top, rest: new Schedule(rest)}
  }

  subtractTime(ms: number): {values: Value<T>[]; rest: Schedule<T>} {
    if (this.isEmpty()) {
      return {rest: this, values: []}
    }
    const {item, rest} = this.takeOne()
    if (item instanceof Value) {
      const r = rest.subtractTime(ms)
      return {rest: r.rest, values: [item, ...r.values]}
    }
    return item.ms <= ms
      ? rest.subtractTime(ms - item.ms)
      : {
          rest: new Schedule([new TimeSpan(item.ms - ms), ...rest.items]),
          values: [],
        }
  }

  timeToEnd(): number {
    return this.items.reduce(
      (result, x) => result + (x instanceof TimeSpan ? x.ms : 0),
      0,
    )
  }

  timeToValue(): number {
    if (this.isEmpty()) {
      return Infinity
    }
    const {item, rest} = this.takeOne()
    return item instanceof Value ? 0 : item.ms + rest.timeToValue()
  }

  toJSON() {
    return this.items
  }
}

type Stream<T> = (cb: (value: T) => void) => (() => void)

type EmulationGenerator<T> = (
  createStream: <U>(...scheduleItems: Array<ScheduleItem<U>>) => Stream<U>,
) => Stream<T>

export function t(ms: number): TimeSpan {
  return new TimeSpan(ms)
}

export function v<T>(x: T): Value<T> {
  return new Value(x)
}

export function emulate<T>(generator: EmulationGenerator<T>): Schedule<T> {
  const state = {
    schedule: new Schedule([]),
    result: [] as Array<ScheduleItem<T>>,
  }

  const resultStream = generator((...scheduleItems) => {
    return cb => {
      state.schedule = state.schedule.merge(
        new Schedule(scheduleItems).withCb(cb),
      )
      return () => {
        state.schedule = new Schedule(
          state.schedule.items.filter(
            item => item instanceof TimeSpan || item.cb !== cb,
          ),
        )
      }
    }
  })

  resultStream(value => state.result.push(new Value(value)))

  while (state.schedule.timeToValue() !== Infinity) {
    const time = state.schedule.timeToValue()
    const {rest, values} = state.schedule.subtractTime(time)
    state.schedule = rest
    state.result.push(new TimeSpan(time))
    values.forEach(item => item.callCb())
  }

  return new Schedule(state.result)
}
