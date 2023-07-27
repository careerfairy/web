import { numberToString } from "../CommonUtil"

describe("numberToString", () => {
   test("converts numbers less than 1000 correctly", () => {
      expect(numberToString(500)).toBe("500")
      expect(numberToString(0)).toBe("0")
   })

   test("converts thousands to k correctly", () => {
      expect(numberToString(1_500)).toBe("1.5k")
      expect(numberToString(50_000)).toBe("50k")
   })

   test("converts around 100k correctly", () => {
      expect(numberToString(99_500)).toBe("99.5k")
      expect(numberToString(100_000)).toBe("100k")
      expect(numberToString(105_000)).toBe("105k")
   })

   test("converts millions to m correctly", () => {
      expect(numberToString(1_500_000)).toBe("1.5m")
      expect(numberToString(50_000_000)).toBe("50m")
   })

   test("converts billions to b correctly", () => {
      expect(numberToString(1_500_000_000)).toBe("1.5b")
      expect(numberToString(50_000_000_000)).toBe("50b")
   })
})
