/* @flow */

import * as bs from './index'
import type {Stream as BasicStream} from './index'

export class Stream<T> {

  observe: BasicStream<T>;

  // Example:
  //
  //    const myWrappedStream = new Stream(sink => {
  //      sink(1)
  //      retrun () => {}
  //    })
  //
  constructor( basicStream:BasicStream<T> ) {

    // The wrapped BasicStream is available as `wrapped.observe`.
    // You can call it as a method in order to subscribe to the stream:
    //
    //    const usub = wrapped.observe(callback)
    //    unsub()
    //
    // Or you can use `wrapped.observe` to extract BasicStream from the wrapper e.g.:
    //
    //    const basicStream2 = lift(x => x * 2)(wrapped.observe)
    //
    this.observe = basicStream
  }

  // Monoid (we don't have .concat though)
  static empty(): Stream<any> {
    return new Stream(bs.empty)
  }
  empty(): Stream<any> {
    return Stream.empty()
  }

  // Functor
  map<A>( f:( x:T ) => A ): Stream<A> {
    return new Stream(bs.lift(f)(this.observe))
  }

  // Apply
  ap<A,B>( other:Stream<A> ): Stream<B> {
    // In order for .ap() to work `this` must be a `Stream<A => B>`,
    // but I don't know how to express that constraint in Flow, so just use `any`
    const streamF:BasicStream<any> = this.observe
    return new Stream(bs.ap(streamF)(other.observe))
  }

  // Applicative
  static of<A>( x:A ): Stream<A> {
    return new Stream(bs.just(x))
  }
  of<A>( x:A ): Stream<A> {
    return Stream.of(x)
  }

  // Chain
  chain<A>( f:( x:T ) => Stream<A> ): Stream<A> {
    return new Stream(bs.chain(x => f(x).observe)(this.observe))
  }

}
