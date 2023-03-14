import { ngrams, triGrams } from "../search"

describe("ngrams", () => {
   it("should return empty array when input string is null or undefined", () => {
      expect(ngrams(null, 2)).toEqual([])
      expect(ngrams(undefined, 3)).toEqual([])
   })

   it("should return array of ngrams of length n", () => {
      expect(ngrams("hello", 2)).toEqual(["he", "el", "ll", "lo"])
      expect(ngrams("world", 3)).toEqual(["wor", "orl", "rld"])
      expect(ngrams("typescript", 4)).toEqual([
         "type",
         "ypes",
         "pesc",
         "escr",
         "scri",
         "crip",
         "ript",
      ])
   })

   it("should return unique ngrams", () => {
      expect(ngrams("ababa", 2)).toEqual(["ab", "ba"])
      expect(ngrams("hell", 4)).toEqual(["hell"])
   })

   it("should return empty array when n is greater than the length of the string", () => {
      expect(ngrams("hello", 10)).toEqual([])
   })
})

describe("triGrams", () => {
   const expected = [
      "the",
      "he ",
      "e q",
      " qu",
      "qui",
      "uic",
      "ick",
      "ck ",
      "k b",
      " br",
      "bro",
      "row",
      "own",
   ]

   it("returns an array of trigrams when passed a string", () => {
      const input = "The quick brown"

      const result = triGrams(input)

      expect(result).toEqual(expected)
   })

   it("returns an array of trigrams when passed an array of strings", () => {
      const input = ["The", "quick", "brown"]

      const result = triGrams(input)

      expect(result).toEqual(expected)
   })

   it("removes accents from strings", () => {
      const input = " déjà vu"

      const result = triGrams(input)

      expect(result).toEqual(["dej", "eja", "ja ", "a v", " vu"])
   })

   it("removes non-alphanumeric characters from strings", () => {
      const input = "The; qui!ck bro.wn"

      const result = triGrams(input)

      expect(result).toEqual(expected)
   })

   it("returns an empty array when passed an empty string or array", () => {
      // Arrange
      const input1 = ""
      const input2: string[] = []

      // Act
      const result1 = triGrams(input1)
      const result2 = triGrams(input2)

      // Assert
      expect(result1).toEqual([])
      expect(result2).toEqual([])
   })

   it("limits the output to 500 characters", () => {
      // Arrange
      const input =
         "The quick brown fox jumps over the lazy dog. " +
         "The quick brown fox jumps over the lazy dog. ".repeat(20)

      // Act
      const result = triGrams(input)

      // Assert
      expect(result.join(" ").length).toBeLessThanOrEqual(500)
   })
})
