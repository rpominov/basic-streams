/* @flow */

import * as bs from './index'
import type {Stream as BasicStream, Transducer} from './index'

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
    //    const basicStream2 = map(x => x * 2)(wrapped.observe)
    //
    this.observe = basicStream
  }

  // Semigroup
  concat( other:Stream<T> ): Stream<T> {
    return new Stream(bs.join([this.observe, other.observe]))
  }

  // Monoid
  static empty(): Stream<any> {
    return new Stream(bs.empty)
  }
  empty(): Stream<any> {
    return Stream.empty()
  }

  // Functor
  map<A>( f:( x:T ) => A ): Stream<A> {
    return new Stream(bs.map(f)(this.observe))
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


  // ------------------ Not from FL ------------------

  filter( f:( x:T ) => boolean ): Stream<T> {
    return new Stream(bs.filter(f)(this.observe))
  }

  scan<A>( f:( r:A, x:T ) => A, seed:A ): Stream<A> {
    return new Stream(bs.scan(f, seed)(this.observe))
  }

  chainLatest<A>( f:( x:T ) => Stream<A> ): Stream<A> {
    return new Stream(bs.chainLatest(x => f(x).observe)(this.observe))
  }

  take( n:number ): Stream<T> {
    return new Stream(bs.take(n)(this.observe))
  }

  takeWhile( f:( x:T ) => boolean ): Stream<T> {
    return new Stream(bs.takeWhile(f)(this.observe))
  }

  takeUntil( other:Stream<mixed> ): Stream<T> {
    return new Stream(bs.takeUntil(other.observe)(this.observe))
  }

  skip( n:number ): Stream<T> {
    return new Stream(bs.skip(n)(this.observe))
  }

  skipWhile( f:( x:T ) => boolean ): Stream<T> {
    return new Stream(bs.skipWhile(f)(this.observe))
  }

  multicast(): Stream<T> {
    return new Stream(bs.multicast(this.observe))
  }

  transduce<A>( transducer:Transducer<A,T> ): Stream<A> {
    return new Stream(bs.transduce(transducer)(this.observe))
  }

  static join<A>( streams:Array<Stream<A>> ): Stream<A> {
    return new Stream(bs.join(streams.map(x => x.observe)))
  }

  static map2<A,B,C>( f:( a:A, b:B ) => C ): ( sA:Stream<A>, sB:Stream<B> ) => Stream<C> {
    const lifted = bs.map2(f)
    return (sA, sB) => new Stream(lifted(sA.observe, sB.observe))
  }

  static map3<A,B,C,D>( f:( a:A, b:B, c:C ) => D ): ( sA:Stream<A>, sB:Stream<B>, sC:Stream<C> ) => Stream<D> {
    const lifted = bs.map3(f)
    return (sA, sB, sC) => new Stream(lifted(sA.observe, sB.observe, sC.observe))
  }

}
