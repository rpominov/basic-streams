import {SObject, curryAll} from 'static-land'

function isDigit(x) {
  return x.charCodeAt(0) >= '0'.charCodeAt(0) && x.charCodeAt(0) <= '9'.charCodeAt(0)
}

const Span = curryAll({
  of(time) {
    return {type: 'span', time}
  },
  map(f, span) {
    return Span.of(f(span.time))
  },
  isInstance(span) {
    return span.type === 'span'
  },
  isNotEmpty(span) {
    return span.time !== 0
  },
  sum(a, b) {
    return Span.of(a.time + b.time)
  },
  toString(span) {
    // this is intentionally returns one less symbol
    return Array(span.time).join('_')
  },
})

const Value = curryAll({
  of(value) {
    return {type: 'value', value}
  },
  isInstance(value) {
    return value.type === 'value'
  },
  toString(value) {
    const type = typeof value.value
    if ((type === 'string' || type === 'number') && String(value.value).length === 1) {
      return String(value.value)
    }
    return `(${JSON.stringify(value.value)})`
  },
})

const Marbles = curryAll({
  skipSpan(time, marbles) {
    return Marbles.mapHeadSpan(t => t - time, marbles)
  },
  mapHeadSpan(f, marbles) {
    const span = Span.map(f, marbles[0])
    const rest = marbles.slice(1)
    return Span.isNotEmpty(span) ? [span].concat(rest) : rest
  },
  popHeadValue(f, marbles) {
    f(marbles[0].value)
    return marbles.slice(1)
  },
  isNotEmpty(marbles) {
    return marbles.length !== 0
  },
  isHeadValue(marbles) {
    return Value.isInstance(marbles[0])
  },
  getHeadTime(marbles) {
    return marbles[0].time
  },
  squashSpans(marbles) {
    return marbles.reduce((acc, x) => {
      const last = acc[acc.length - 1]
      if (last && Span.isInstance(last) && Span.isInstance(x)) {
        return acc.slice(0, acc.length - 1).concat([Span.sum(last, x)])
      }
      return acc.concat([x])
    }, [])
  },
  toString(marbles) {
    return marbles.map(x => Value.isInstance(x) ? Value.toString(x) : Span.toString(x)).join('')
  },
  fromString(str) {
    // {stuff} not supported
    return Marbles.squashSpans(str.split('').map(
      x => x === '_' ? [span(1)] : [span(1), value(isDigit(x) ? Number(x) : x)]
    ).reduce((a, b) => a.concat(b), []))
  },
})

const QueueItem = curryAll({
  map(f, item) {
    return {sink: item.sink, marbles: f(item.marbles)}
  },
  skipSpan(time, item) {
    return QueueItem.map(Marbles.skipSpan(time), item)
  },
  applyValue(item) {
    return QueueItem.map(Marbles.popHeadValue(item.sink), item)
  },
  isNotEmpty(item) {
    return Marbles.isNotEmpty(item.marbles)
  },
  isHeadValue(item) {
    return Marbles.isHeadValue(item.marbles)
  },
  getHeadTime(item) {
    return Marbles.getHeadTime(item.marbles)
  },
})

const Queue = curryAll({
  map(f, queue) {
    return Queue.cleanup(queue.map(f))
  },
  mapItem(f, item, queue) {
    return Queue.map(i => i === item ? f(i) : i, queue)
  },
  cleanup(queue) {
    return queue.filter(QueueItem.isNotEmpty)
  },
  execNext(onSpanSkip, queue) {
    let smallestSpan = Infinity
    for (let item of queue) {
      if (QueueItem.isHeadValue(item)) {
        return Queue.mapItem(QueueItem.applyValue, item, queue)
      } else {
        smallestSpan = Math.min(QueueItem.getHeadTime(item), smallestSpan)
      }
    }
    onSpanSkip(smallestSpan)
    return Queue.map(QueueItem.skipSpan(smallestSpan), queue)
  },
  isNotEmpty(queue) {
    return queue.length !== 0
  },
  push(item, queue) {
    return queue.concat([item])
  },
  removeBySink(sink, queue) {
    return queue.filter(i => i.sink !== sink)
  },
})


export function span(time) {
  return Span.of(time)
}

export function value(value) {
  return Value.of(value)
}

export function fromString(str) {
  return Marbles.fromString(str)
}

export function toString(marbles) {
  return Marbles.toString(marbles)
}

export function exec(sourcesSpec, transformer) {

  let queue = []
  let inUpdate = false
  const plannedUpdates = []
  function updateQueue(f) {
    plannedUpdates.push(f)
    if (inUpdate) {
      return
    }
    inUpdate = true
    while(plannedUpdates.length > 0) {
      queue = plannedUpdates.shift()(queue)
    }
    inUpdate = false
  }

  const sources = SObject.map(marbles => {
    return sink => {
      updateQueue(Queue.push({sink, marbles}))
      return () => {updateQueue(Queue.removeBySink(sink))}
    }
  }, sourcesSpec)

  const result = []
  function toResult(type) {
    return x => {result.push(type(x))}
  }

  const targetStream = transformer(sources)
  const disposeTarget = targetStream(toResult(value))

  while (Queue.isNotEmpty(queue)) {
    updateQueue(Queue.execNext(toResult(span)))
  }

  disposeTarget()
  return Marbles.squashSpans(result)
}
