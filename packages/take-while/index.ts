import {Stream} from "@basic-streams/stream"

interface State<T> {
  cb: (x: T) => void
  sourceDisposer?: (() => void)
}

export default function takeWhile<T>(
  predicate: (x: T) => boolean,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let state: State<T> | null = {cb}

    function stop() {
      if (state !== null) {
        const {sourceDisposer} = state
        state = null
        if (sourceDisposer) {
          sourceDisposer()
        }
      }
    }

    function onEvent(x: T) {
      if (state !== null) {
        if (predicate(x)) {
          const {cb} = state
          cb(x)
        } else {
          stop()
        }
      }
    }

    const sourceDisposer = stream(onEvent)

    if (state === null) {
      sourceDisposer()
    } else {
      state.sourceDisposer = sourceDisposer
    }

    return stop
  }
}
