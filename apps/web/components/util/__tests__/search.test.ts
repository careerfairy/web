import { customMatch } from "../search"

describe("customMatch", () => {
   test("should return an empty array when no matches are found", () => {
      const text = "This is a test string"
      const query = "xyz"
      const result = customMatch(text, query)
      expect(result).toEqual([])
   })

   test("should return match indices for a single match", () => {
      const text = "This is a test string"
      const query = "test"
      const result = customMatch(text, query)
      expect(result).toEqual([[10, 14]])
   })

   test("should return match indices for multiple matches", () => {
      const text = "This is a test string with another test"
      const query = "test"
      const result = customMatch(text, query)
      expect(result).toEqual([
         [10, 14],
         [35, 39],
      ])
   })

   test("should return match indices for case-insensitive matches", () => {
      const text = "This is a Test string"
      const query = "test"
      const result = customMatch(text, query)
      expect(result).toEqual([[10, 14]])
   })

   test("should return match indices for matches in the middle of words", () => {
      const text = "This is a contest string"
      const query = "test"
      const result = customMatch(text, query)
      expect(result).toEqual([[13, 17]])
   })

   test("should handle special characters in the query", () => {
      const text = "This is a test string"
      const query = "$test$"
      const result = customMatch(text, query)
      expect(result).toEqual([[10, 14]])
   })
})
