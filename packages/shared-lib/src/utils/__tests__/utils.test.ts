import { filterByField } from "../../recommendation/utils"
import { getNestedProperty } from "../utils"

const obj = { prop1: { prop2: { prop3: "dog" } } }

test("getNestedProperty should return correct nested property via path string", () => {
   expect(getNestedProperty(obj, "prop1.prop2.prop3")).toBe("dog")
})

test("getNestedProperty should return correct nested property via array path", () => {
   expect(getNestedProperty(obj, ["prop1", "prop2", "prop3"])).toBe("dog")
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
