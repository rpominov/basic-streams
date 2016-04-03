/* @flow */

import fl from 'fantasy-land'
import * as bs from './main'
import Compose from './compose'

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
    this.observe = bs.fromLoose(basicStream)
  }

  // Semigroup
  concat(other) {
    return new Stream(bs.merge([this.observe, other.observe]))
  }

  // Monoid
  static empty() {
    return new Stream(bs.empty)
  }
  empty() {
    return Stream.empty()
  }

  // Functor
  map(f) {
    return new Stream(bs.map(f)(this.observe))
  }

  // Apply
  ap(other) {
    const streamF = this.observe
    return new Stream(bs.ap(streamF)(other.observe))
  }

  // Applicative
  static of(x) {
    return new Stream(bs.just(x))
  }
  of(x) {
    return Stream.of(x)
  }

  // Chain
  chain(f) {
    return new Stream(bs.chain(x => f(x).observe)(this.observe))
  }


  // ------------------ Not from FL ------------------

  filter(f) {
    return new Stream(bs.filter(f)(this.observe))
  }

  scan(f, seed) {
    return new Stream(bs.scan(f, seed)(this.observe))
  }

  chainLatest(f) {
    return new Stream(bs.chainLatest(x => f(x).observe)(this.observe))
  }

  take(n) {
    return new Stream(bs.take(n)(this.observe))
  }

  takeWhile(f) {
    return new Stream(bs.takeWhile(f)(this.observe))
  }

  takeUntil(other) {
    return new Stream(bs.takeUntil(other.observe)(this.observe))
  }

  skip(n) {
    return new Stream(bs.skip(n)(this.observe))
  }

  skipWhile(f) {
    return new Stream(bs.skipWhile(f)(this.observe))
  }

  skipDuplicates(f) {
    return new Stream(bs.skipDuplicates(f)(this.observe))
  }

  multicast() {
    return new Stream(bs.multicast(this.observe))
  }

  startWith(x) {
    return new Stream(bs.startWith(x)(this.observe))
  }

  transduce(transducer) {
    return new Stream(bs.transduce(transducer)(this.observe))
  }

  static merge(streams) {
    return new Stream(bs.merge(streams.map(x => x.observe)))
  }

  static map2(f) {
    const lifted = bs.map2(f)
    return (sA, sB) => new Stream(lifted(sA.observe, sB.observe))
  }

  static map3(f) {
    const lifted = bs.map3(f)
    return (sA, sB, sC) => new Stream(lifted(sA.observe, sB.observe, sC.observe))
  }

  static combineArray(arr) {
    return new Stream(bs.combineArray(arr.map(x => x.observe)))
  }

  static combineObject(obj) {
    const ofBasicStreams = {}
    Object.keys(obj).forEach(key => {
      ofBasicStreams[key] = obj[key].observe
    })
    return new Stream(bs.combineObject(ofBasicStreams))
  }

  static Compose(InnerType) {
    return Compose(InnerType)
  }

}

function addFlMethods(constructor, proto) {
  ['concat', 'empty', 'map', 'ap', 'of', 'chain'].forEach(name => {
    proto[fl[name]] = proto[name]
  })
  ;['empty', 'of'].forEach(name => {
    constructor[fl[name]] = constructor[name]
  })
}
addFlMethods(Stream, Stream.prototype)
