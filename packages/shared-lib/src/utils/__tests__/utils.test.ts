import {
   TruncationResult,
   calculateOptimalTruncation,
   getNestedProperty,
} from "../utils"

const obj = { prop1: { prop2: { prop3: "dog" } } }

test("getNestedProperty should return correct nested property via path string", () => {
   expect(getNestedProperty(obj, "prop1.prop2.prop3")).toBe("dog")
})

test("getNestedProperty should return correct nested property via array path", () => {
   expect(getNestedProperty(obj, ["prop1", "prop2", "prop3"])).toBe("dog")
})

// Mock CanvasRenderingContext2D and its measureText method
const mockMeasureText = (
   text: string,
   charWidthFactor = 8, // Default width per character
   customWidths: Record<string, number> = {}
): { width: number } => {
   if (customWidths[text] !== undefined) {
      return { width: customWidths[text] }
   }
   return { width: text.length * charWidthFactor }
}

const getMockContext = (
   charWidthFactor = 8,
   customWidths: Record<string, number> = {}
): CanvasRenderingContext2D => {
   return {
      measureText: (text: string) =>
         mockMeasureText(text, charWidthFactor, customWidths),
      // Add other CanvasRenderingContext2D methods and properties if needed by the function under test, mock them as jest.fn()
      // For calculateOptimalTruncation, only measureText and font are accessed. Font is only set, not read directly within calculateOptimalTruncation.
      font: "", // Mock the font property as it's set in useTextTruncation before calling calculateOptimalTruncation
   } as unknown as CanvasRenderingContext2D // Cast to satisfy type, only implementing what's used
}

describe("calculateOptimalTruncation", () => {
   const SEPARATOR = ", "

   test("should return original text if items are empty or ctx is null", () => {
      const mockCtx = getMockContext()
      expect(
         calculateOptimalTruncation(null, ["Item 1"], 100, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "Item 1",
         plusCount: null,
         shouldShowTooltip: false,
      })
      expect(
         calculateOptimalTruncation(mockCtx, [], 100, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "",
         plusCount: null,
         shouldShowTooltip: false,
      })
      expect(
         calculateOptimalTruncation(mockCtx, null, 100, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "",
         plusCount: null,
         shouldShowTooltip: false,
      })
   })

   test("should return full text if it fits within containerWidth", () => {
      const mockCtx = getMockContext(10) // Each char is 10px wide
      const items = ["Apple", "Banana"] // "Apple, Banana" length 13 -> 130px
      const containerWidth = 150

      expect(
         calculateOptimalTruncation(mockCtx, items, containerWidth, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "Apple, Banana",
         plusCount: null,
         shouldShowTooltip: false,
      })
   })

   test("should truncate a single item if it exceeds containerWidth", () => {
      const mockCtx = getMockContext(10) // Each char is 10px wide
      const items = ["VeryLongItemName"] // Length 16 -> 160px
      const containerWidth = 100 // Allows 10 chars. Corrected: "VeryLon..." (7 chars of item + 3 for ... = 10 chars)
      expect(
         calculateOptimalTruncation(mockCtx, items, containerWidth, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "VeryLon...", // Corrected expectation
         plusCount: null,
         shouldShowTooltip: true,
      })
   })

   test("should truncate the last item of multiple if combined text exceeds containerWidth", () => {
      const items = ["Apple", "Blueberry", "Cherry"]

      const customWidths = {
         "Apple, Blueberry, Cherr...": 220,
         "Apple, Blueberry, Cher...": 210,
         "Apple, Blueberry, Che...": 200,
      }
      const mockCtxCustom = getMockContext(10, customWidths)
      expect(
         calculateOptimalTruncation(mockCtxCustom, items, 200, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "Apple, Blueberry, Che...",
         plusCount: null,
         shouldShowTooltip: true,
      })
   })

   test("should show plusCount if items are truncated and plusCount string fits", () => {
      const mockCtx = getMockContext(10)
      const items = ["One", "Two", "Three", "Four", "Five"]
      const containerWidth = 150 // Allows 15 chars. "One, Two" (8) + ", +3" (4) = 12 chars. Fits.
      expect(
         calculateOptimalTruncation(mockCtx, items, containerWidth, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "One, Two", // Corrected: text without plus string
         plusCount: 3, // Corrected: plusCount separate
         shouldShowTooltip: true,
      })
   })

   test("should truncate last shown item before showing plusCount if necessary", () => {
      const mockCtx = getMockContext(10)
      const items = ["Apple", "VeryLongBanana", "Cherry"]
      const containerWidth = 200 // Allows 20 chars. "Apple, VeryLo..." (16) + ", +1" (4) = 20 chars. Fits.
      expect(
         calculateOptimalTruncation(mockCtx, items, containerWidth, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "Apple, VeryLo...", // Corrected: text without plus string
         plusCount: 1, // Corrected: plusCount separate
         shouldShowTooltip: true,
      })
   })

   test("should handle different separators", () => {
      const mockCtx = getMockContext(10)
      const items = ["Red", "Green", "Blue"]
      const localSeparator = " | "
      const containerWidth = 120 // Allows 12 chars. "Red" (3) + " | +2" (5) = 8 chars. Fits.
      expect(
         calculateOptimalTruncation(
            mockCtx,
            items,
            containerWidth,
            localSeparator
         )
      ).toEqual<TruncationResult>({
         truncatedText: "Red", // Corrected expectation
         plusCount: 2, // Corrected expectation
         shouldShowTooltip: true,
      })
   })

   test("containerWidth of 0", () => {
      const mockCtx = getMockContext(10)
      const items = ["Apple", "Banana"]
      expect(
         calculateOptimalTruncation(mockCtx, items, 0, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "",
         plusCount: null,
         shouldShowTooltip: true,
      })
      const items2 = ["A"]
      expect(
         calculateOptimalTruncation(mockCtx, items2, 0, SEPARATOR)
      ).toEqual<TruncationResult>({
         truncatedText: "",
         plusCount: null,
         shouldShowTooltip: true,
      })
   })
})
