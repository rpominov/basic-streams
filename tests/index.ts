import {sum} from "../source/index"

it("example", () => {
  expect(sum(5, 1)).toMatchSnapshot()
})
