/* @flow */

import fl from 'fantasy-land'
import BS from './main'

export class Stream {

  // Example:
  //
  //    const myWrappedStream = new Stream(sink => {
  //      sink(1)
  //      retrun () => {}
  //    })
  //
  constructor(basicStream) {

    // The wrapped BasicStream is available as `wrapped.observe`.
    // You can call it as a method in order to subscribe to the stream:
    //
    //    const usub = wrapped.observe(callback)
    //    unsub()
    //
    // Or you can use `wrapped.observe` to extract BasicStream from the wrapper e.g.:
    //
    //    const basicStream2 = map(x => x * 2)(wrapped.observe)
    //
    this.observe = BS.fromLoose(basicStream)
  }

  // Semigroup
  [fl.concat](other) {
    return new Stream(BS.concat([this.observe, other.observe]))
  }

  // Monoid
  static [fl.empty]() {
    return new Stream(BS.empty())
  }
  [fl.empty]() {
    return Stream.empty()
  }

  // Functor
  [fl.map](f) {
    return new Stream(BS.map(f)(this.observe))
  }

  // Apply
  [fl.ap](other) {
    const streamF = this.observe
    return new Stream(BS.ap(streamF)(other.observe))
  }

  // Applicative
  static [fl.of](x) {
    return new Stream(BS.of(x))
  }
  [fl.of](x) {
    return Stream.of(x)
  }

  // Monad
  [fl.chain](f) {
    return new Stream(BS.chain(x => f(x).observe)(this.observe))
  }


  // ------------------ Not from FL ------------------

  filter(f) {
    return new Stream(BS.filter(f)(this.observe))
  }

  scan(f, seed) {
    return new Stream(BS.scan(f, seed)(this.observe))
  }

  chainLatest(f) {
    return new Stream(BS.chainLatest(x => f(x).observe)(this.observe))
  }

  take(n) {
    return new Stream(BS.take(n)(this.observe))
  }

  takeWhile(f) {
    return new Stream(BS.takeWhile(f)(this.observe))
  }

  takeUntil(other) {
    return new Stream(BS.takeUntil(other.observe)(this.observe))
  }

  skip(n) {
    return new Stream(BS.skip(n)(this.observe))
  }

  skipWhile(f) {
    return new Stream(BS.skipWhile(f)(this.observe))
  }

  skipDuplicates(f) {
    return new Stream(BS.skipDuplicates(f)(this.observe))
  }

  multicast() {
    return new Stream(BS.multicast(this.observe))
  }

  startWith(x) {
    return new Stream(BS.startWith(x)(this.observe))
  }

  transduce(transducer) {
    return new Stream(BS.transduce(transducer)(this.observe))
  }

  static map2(f) {
    const lifted = BS.map2(f)
    return (sA, sB) => new Stream(lifted(sA.observe, sB.observe))
  }

  static map3(f) {
    const lifted = BS.map3(f)
    return (sA, sB, sC) => new Stream(lifted(sA.observe, sB.observe, sC.observe))
  }

  static combineArray(arr) {
    return new Stream(BS.combineArray(arr.map(x => x.observe)))
  }

  static combineObject(obj) {
    const ofBasicStreams = {}
    Object.keys(obj).forEach(key => {
      ofBasicStreams[key] = obj[key].observe
    })
    return new Stream(BS.combineObject(ofBasicStreams))
  }

}
