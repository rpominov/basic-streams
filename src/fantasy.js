/* @flow */

import * as bs from './index'
import type {Stream as BasicStream} from './index'

export class Stream<T> {

  observe: BasicStream<T>;

  constructor( basicStream:BasicStream<T> ) {
    this.observe = basicStream
  }

  // Monoid
  empty(): Stream<any> {
    return new Stream(bs.empty)
  }
  static empty(): Stream<any> {
    return new Stream(bs.empty)
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
  of<A>( x:A ): Stream<A> {
    return new Stream(bs.just(x))
  }
  static of<A>( x:A ): Stream<A> {
    return new Stream(bs.just(x))
  }

  // Chain
  chain<A>( f:( x:T ) => Stream<A> ): Stream<A> {
    return new Stream(bs.chain(x => f(x).observe)(this.observe))
  }

}
