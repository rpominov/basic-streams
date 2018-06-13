import _test from "lobot/test"
import {span, value, fromString, toString} from "../src/marbles"

const test = _test.wrap("marbles")

test.wrap("toString", test => {
  test("span converted to a number of _", 5, t => {
    t.equal(toString([span(1)]), "_")
    t.equal(toString([span(2)]), "__")
    t.equal(toString([span(1), span(1)]), "__")
    t.equal(toString([span(1), span(2)]), "___")
    t.equal(toString([span(2), span(1)]), "___")
  })

  test("1 char values shown as is", 6, t => {
    t.equal(toString([value(1)]), "1")
    t.equal(toString([value(1), span(1)]), "1_")
    t.equal(toString([span(1), value(1)]), "_1")
    t.equal(toString([span(1), value(1), span(1)]), "_1_")
    t.equal(toString([value("a")]), "a")
    t.equal(toString([span(3), value("a"), span(3)]), "___a___")
  })

  test("2+ char values shown as (stringify(x))", 7, t => {
    t.equal(toString([value(10)]), "(10)")
    t.equal(toString([value(10), span(1)]), "(10)_")
    t.equal(toString([span(1), value(10)]), "_(10)")
    t.equal(toString([span(1), value(10), span(1)]), "_(10)_")
    t.equal(toString([value("aa")]), '("aa")')
    t.equal(toString([span(3), value("aa"), span(3)]), '___("aa")___')
    t.equal(toString([value({a: 1})]), '({"a":1})')
  })
})

test.wrap("fromString", test => {
  test("_ converted to span(n)", 3, t => {
    t.deepEqual(fromString("_"), [span(1)])
    t.deepEqual(fromString("__"), [span(2)])
    t.deepEqual(fromString("__________"), [span(10)])
  })

  test("_x_ converted to [span, value, span]", 4, t => {
    t.deepEqual(fromString("_a_"), [span(1), value("a"), span(1)])
    t.deepEqual(fromString("a_"), [value("a"), span(1)])
    t.deepEqual(fromString("_a"), [span(1), value("a")])
    t.deepEqual(fromString("__a__"), [span(2), value("a"), span(2)])
  })

  test("numbers converted to value(n)", 1, t => {
    t.deepEqual(fromString("_3_"), [span(1), value(3), span(1)])
  })

  test("spaces ignored", 4, t => {
    t.deepEqual(fromString("_ a _"), [span(1), value("a"), span(1)])
    t.deepEqual(fromString("a _"), [value("a"), span(1)])
    t.deepEqual(fromString(" _ a"), [span(1), value("a")])
    t.deepEqual(fromString("_ _a   __"), [span(2), value("a"), span(2)])
  })

  test("multy-char values are not supported", 1, t => {
    t.deepEqual(fromString("_(10)_"), [
      span(1),
      value("("),
      value(1),
      value(0),
      value(")"),
      span(1),
    ])
  })
})
