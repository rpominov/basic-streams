import {Stream} from "@basic-streams/stream"

export default function multicast<T>(stream: Stream<T>): Stream<T> {
  const callbacks: Array<null | ((x: T) => void)> = []
  let activeCallbacks = 0
  let sourceSubscription: {disposer?: () => void} | null = null

  function startSource() {
    const currentSubscription = {}
    sourceSubscription = currentSubscription
    const disposer = stream(callCallbacks)
    if (sourceSubscription === currentSubscription) {
      sourceSubscription.disposer = disposer
    } else {
      disposer()
    }
  }

  function stopSource() {
    if (sourceSubscription !== null) {
      const {disposer} = sourceSubscription
      sourceSubscription = null
      if (disposer) {
        disposer()
      }
    }
  }

  function callCallbacks(x: T) {
    for (let i = 0; i < callbacks.length; i++) {
      const callback = callbacks[i]
      if (callback !== null) {
        callback(x)
      }
    }
  }

  return cb => {
    const cbIndex = callbacks.push(cb) - 1
    activeCallbacks++
    if (activeCallbacks === 1) {
      startSource()
    }
    return () => {
      if (callbacks[cbIndex] !== null) {
        callbacks[cbIndex] = null
        activeCallbacks--
        if (activeCallbacks === 0) {
          stopSource()
        }
      }
    }
  }
}
