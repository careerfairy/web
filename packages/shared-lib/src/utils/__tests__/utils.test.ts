import { filterByField } from "../../recommendation/utils"
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

describe("filterByField", () => {
   // Test data setup
   interface TestItem {
      id: number
      name: string
      active: boolean
      tags: string[]
      category: { id: number; name: string }
      categories: { id: string; name: string }[]
   }
   const testData: TestItem[] = [
      {
         id: 1,
         name: "one",
         active: true,
         tags: ["a", "b"],
         category: { id: 101, name: "Category 1" },
         categories: [
            { id: "catA", name: "Cat A" },
            { id: "catB", name: "Cat B" },
         ],
      },
      {
         id: 2,
         name: "two",
         active: false,
         tags: ["b", "c"],
         category: { id: 102, name: "Category 2" },
         categories: [
            { id: "catC", name: "Cat C" },
            { id: "catB", name: "Cat B" },
         ],
      },
      {
         id: 3,
         name: "three",
         active: true,
         tags: ["c", "d"],
         category: { id: 101, name: "Category 1" },
         categories: [{ id: "catA", name: "Cat A" }],
      },
      {
         id: 4,
         name: "four",
         active: false,
         tags: ["a", "d"],
         category: { id: 103, name: "Category 3" },
         categories: [],
      },
   ]

   const identityGetItem = (item: TestItem) => item

   test("should filter by a single primitive string value", () => {
      const result = filterByField(testData, identityGetItem, "name", "one")
      expect(result).toEqual([testData[0]])
   })

   test("should filter by a single primitive number value", () => {
      const result = filterByField(testData, identityGetItem, "id", 2)
      expect(result).toEqual([testData[1]])
   })

   test("should filter by a single primitive boolean value", () => {
      const result = filterByField(testData, identityGetItem, "active", true)
      expect(result).toEqual([testData[0], testData[2]])
   })

   test("should filter by multiple primitive values", () => {
      const result = filterByField(testData, identityGetItem, "name", [
         "one",
         "three",
      ])
      expect(result).toEqual([testData[0], testData[2]])
   })

   test("should filter by a value in an array field", () => {
      const result = filterByField(testData, identityGetItem, "tags", "a")
      expect(result).toEqual([testData[0], testData[3]])
   })

   test("should filter by multiple values in an array field", () => {
      const result = filterByField(testData, identityGetItem, "tags", [
         "a",
         "c",
      ])
      expect(result).toEqual([
         testData[0],
         testData[1],
         testData[2],
         testData[3],
      ])
   })

   test("should filter by a nested object's numeric id", () => {
      const result = filterByField(testData, identityGetItem, "category", 101)
      expect(result).toEqual([testData[0], testData[2]])
   })

   test("should filter by a nested object's id from a list of numeric ids", () => {
      const result = filterByField(
         testData,
         identityGetItem,
         "category",
         [101, 103]
      )
      expect(result).toEqual([testData[0], testData[2], testData[3]])
   })

   test("should filter by ids in an array of nested objects", () => {
      const result = filterByField(
         testData,
         identityGetItem,
         "categories",
         "catB"
      )
      expect(result).toEqual([testData[0], testData[1]])
   })

   test("should filter by multiple ids in an array of nested objects", () => {
      const result = filterByField(testData, identityGetItem, "categories", [
         "catA",
         "catC",
      ])
      expect(result).toEqual([testData[0], testData[1], testData[2]])
   })

   test("should respect the limit parameter", () => {
      const result = filterByField(
         testData,
         identityGetItem,
         "name",
         ["one", "two", "three"],
         2
      )
      expect(result).toEqual([testData[0], testData[1]])
   })

   test("should return an empty array if no matches are found", () => {
      const result = filterByField(testData, identityGetItem, "name", "five")
      expect(result).toEqual([])
   })

   test("should return an empty array for empty filter values", () => {
      const result = filterByField(testData, identityGetItem, "name", [])
      expect(result).toEqual([])
   })

   // This is the "deeper inside the model" test case
   describe("with nested data structure (RankedCustomJobsRepository-like)", () => {
      interface JobDetails {
         id: string
         title: string
         companyId: string
         locations: { id: string; city: string }[]
      }
      interface RankedJob {
         rank: number
         model: {
            jobDetails: JobDetails
         }
      }
      const rankedJobs: RankedJob[] = [
         {
            rank: 1,
            model: {
               jobDetails: {
                  id: "job1",
                  title: "SWE",
                  companyId: "compA",
                  locations: [{ id: "loc1", city: "Zurich" }],
               },
            },
         },
         {
            rank: 2,
            model: {
               jobDetails: {
                  id: "job2",
                  title: "PM",
                  companyId: "compB",
                  locations: [
                     { id: "loc2", city: "Berlin" },
                     { id: "loc1", city: "Zurich" },
                  ],
               },
            },
         },
         {
            rank: 3,
            model: {
               jobDetails: {
                  id: "job3",
                  title: "Designer",
                  companyId: "compA",
                  locations: [{ id: "loc3", city: "Paris" }],
               },
            },
         },
      ]

      const getJobDetails = (item: RankedJob) => item.model.jobDetails

      test("should filter on a deeply nested property", () => {
         const result = filterByField(
            rankedJobs,
            getJobDetails,
            "companyId",
            "compA"
         )
         expect(result).toEqual([rankedJobs[0], rankedJobs[2]])
      })

      test("should filter on a deeply nested array of objects", () => {
         const result = filterByField(
            rankedJobs,
            getJobDetails,
            "locations",
            "loc1"
         )
         expect(result).toEqual([rankedJobs[0], rankedJobs[1]])
      })
   })
})
