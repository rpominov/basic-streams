import {Stream} from "@basic-streams/stream"

interface State<T> {
  cb: (x: T) => void
  sourceDisposer?: (() => void)
  controllerDisposer?: (() => void)
}

function noop() {}

export default function takeUntil<T>(
  controller: Stream<any>,
  stream: Stream<T>,
): Stream<T> {
  return cb => {
    let state: State<T> | null = {cb}

    function stop() {
      if (state !== null) {
        const {controllerDisposer, sourceDisposer} = state
        state = null
        if (controllerDisposer) {
          controllerDisposer()
        }
        if (sourceDisposer) {
          sourceDisposer()
        }
      }
    }

    function onEvent(x: T) {
      if (state !== null) {
        const {cb} = state
        cb(x)
      }
    }

    const controllerDisposer = controller(stop)

    if (state === null) {
      controllerDisposer()
      stream(noop)()
    } else {
      state.controllerDisposer = controllerDisposer
      const sourceDisposer = stream(onEvent)
      if (state === null) {
        sourceDisposer()
      } else {
        state.sourceDisposer = sourceDisposer
      }
    }

    return stop
  }
}
