function isDigit(x) {
  return x.charCodeAt(0) >= '0'.charCodeAt(0) && x.charCodeAt(0) <= '9'.charCodeAt(0)
}

// Represents a time span (dash) on marbles line
const Span = {
  of(time) {
    return {type: 'span', time}
  },
  map(f, span) {
    return Span.of(f(span.time))
  },
  isInstance(span) {
    return span.type === 'span'
  },
  isEmpty(span) {
    return span.time === 0
  },
  sum(a, b) {
    return Span.of(a.time + b.time)
  },
  toString(span) {
    return Array(span.time + 1).join('_')
  },
}

// Represents a value (event/marble ball) on marbles line
const Value = {
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
}

// Represents a marbles line
const Marbles = {
  ensureNotEmpty(marbles, context) {
    if (Marbles.isEmpty(marbles)) {
      throw new Error(`marbles are empty in ${context}`)
    }
  },
  ensureHeadSpan(marbles, context) {
    Marbles.ensureNotEmpty(marbles, context)
    if (!Span.isInstance(marbles[0])) {
      throw new Error(`marbles don\'t have a Span at top in ${context}`)
    }
  },
  ensureHeadValue(marbles, context) {
    Marbles.ensureNotEmpty(marbles, context)
    if (!Value.isInstance(marbles[0])) {
      throw new Error(`marbles don\'t have a Value at top in ${context}`)
    }
  },
  skipSpan(time, marbles) {
    Marbles.ensureHeadSpan(marbles, 'skipSpan()')
    const headSpan = marbles[0]
    const nextHeadSpan = Span.map(t => t - time, headSpan)
    const rest = marbles.slice(1)
    return Span.isEmpty(nextHeadSpan) ? rest : [nextHeadSpan].concat(rest)
  },
  popHeadValue(f, marbles) {
    Marbles.ensureHeadValue(marbles, 'popHeadValue()')
    f(marbles[0].value)
    return marbles.slice(1)
  },
  isEmpty(marbles) {
    return marbles.length === 0
  },
  isHeadValue(marbles) {
    Marbles.ensureNotEmpty(marbles, 'isHeadValue()')
    return Value.isInstance(marbles[0])
  },
  getHeadTime(marbles) {
    Marbles.ensureHeadSpan(marbles, 'getHeadTime()')
    return marbles[0].time
  },
  squashSpans(marbles) {
    return marbles.reduce((acc, x) => {
      const last = acc[acc.length - 1]
      return last && Span.isInstance(last) && Span.isInstance(x)
        ? acc.slice(0, acc.length - 1).concat([Span.sum(last, x)])
        : acc.concat([x])
    }, [])
  },
  toString(marbles) {
    return marbles.map(x => Value.isInstance(x) ? Value.toString(x) : Span.toString(x)).join('')
  },
  fromString(str) {
    const mapFn = x => {
      if (x === ' ') {
        return []
      }
      // Only 1 character numbers or strings are supported here
      return x === '_' ? [span(1)] : [value(isDigit(x) ? Number(x) : x)]
    }
    const concat = (a, b) => a.concat(b)
    return Marbles.squashSpans(str.split('').map(mapFn).reduce(concat, []))
  },
}

// Represents marbles line with a sink attached (to sink values to)
const QueueItem = {
  map(f, item) {
    return {sink: item.sink, marbles: f(item.marbles)}
  },
  skipSpan(time, item) {
    return QueueItem.map(marbles => Marbles.skipSpan(time, marbles), item)
  },
  applyValue(item) {
    return QueueItem.map(marbles => Marbles.popHeadValue(item.sink, marbles), item)
  },
  isEmpty(item) {
    return Marbles.isEmpty(item.marbles)
  },
  isHeadValue(item) {
    return Marbles.isHeadValue(item.marbles)
  },
  getHeadTime(item) {
    return Marbles.getHeadTime(item.marbles)
  },
}

// Represents several QueueItems that are executed together
const Queue = {
  map(f, queue) {
    return Queue.cleanup(queue.map(f))
  },
  mapItem(f, item, queue) {
    return Queue.map(i => i === item ? f(i) : i, queue)
  },
  cleanup(queue) {
    return queue.filter(x => !QueueItem.isEmpty(x))
  },
  execNext(onSpanSkip, queue) {
    let smallestSpan = Infinity
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]
      if (QueueItem.isHeadValue(item)) {
        return Queue.mapItem(QueueItem.applyValue, item, queue)
      } else {
        smallestSpan = Math.min(QueueItem.getHeadTime(item), smallestSpan)
      }
    }
    onSpanSkip(smallestSpan)
    return Queue.map(q => QueueItem.skipSpan(smallestSpan, q), queue)
  },
  isEmpty(queue) {
    return queue.length === 0
  },
  push(item, queue) {
    return queue.concat([item])
  },
  removeBySink(sink, queue) {
    return queue.filter(i => i.sink !== sink)
  },
}


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

  const sources = {}
  for (let key in sourcesSpec) {
    const marbles = sourcesSpec[key]
    sources[key] = sink => {
      updateQueue(q => Queue.push({sink, marbles}, q))
      return () => {updateQueue(q => Queue.removeBySink(sink, q))}
    }
  }

  const result = []
  function toResult(type) {
    return x => {result.push(type(x))}
  }

  const targetStream = transformer(sources)
  const disposeTarget = targetStream(toResult(value))

  while (!Queue.isEmpty(queue)) {
    updateQueue(q => Queue.execNext(toResult(span), q))
  }

  disposeTarget()
  return Marbles.squashSpans(result)
}
//
// /* TODO
//
// renderMany({
//   a: fromString(...),
//   b: fromString(...),
//   c: fromString(...),
// })
//
// a: _ _1___
// b: _1_ ___
//
// */
