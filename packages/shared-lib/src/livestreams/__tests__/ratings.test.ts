import { normalizeRating } from "../ratings"

it("should calculate the correct rating for sentiment answer", () => {
   expect(
      normalizeRating(
         {
            isSentimentRating: true,
         } as any,
         { rating: 1 }
      )
   ).toBe(1)

   expect(
      normalizeRating(
         {
            isSentimentRating: true,
         } as any,
         { rating: 2 }
      )
   ).toBe(3)

   expect(
      normalizeRating(
         {
            isSentimentRating: true,
         } as any,
         { rating: 3 }
      )
   ).toBe(5)
})

it("should calculate the correct rating for normal rating answer", () => {
   expect(normalizeRating({} as any, { rating: 1 })).toBe(1)
   expect(normalizeRating({} as any, { rating: 2 })).toBe(2)
   expect(normalizeRating({} as any, { rating: 3 })).toBe(3)
   expect(normalizeRating({} as any, { rating: 4 })).toBe(4)
   expect(normalizeRating({} as any, { rating: 5 })).toBe(5)
})

it("should not be able to calculate the rating", () => {
   expect(normalizeRating({ noStars: true } as any, { rating: 1 })).toBe(null)
   expect(normalizeRating({} as any, {})).toBe(null)
})
