import {Stream} from "@basic-streams/stream"

interface State<T> {
  cb: (x: T) => void
  count: number
  disposer?: () => void
}

export default function take<T>(n: number, stream: Stream<T>): Stream<T> {
  return cb => {
    let state: State<T> | null = {cb, count: 0}

    function stop() {
      if (state !== null) {
        const {disposer} = state
        state = null
        if (disposer) {
          disposer()
        }
      }
    }

    function onEvent(x: T) {
      if (state !== null) {
        const {cb} = state
        cb(x)
        state.count++
        if (state.count >= n) {
          stop()
        }
      }
    }

    if (n === 0) {
      state = null
    }

    const disposer = stream(onEvent)

    if (state === null) {
      disposer()
    } else {
      state.disposer = disposer
    }

    return stop
  }
}
