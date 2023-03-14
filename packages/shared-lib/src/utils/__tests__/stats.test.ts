import { getAValidGroupStatsUpdateField } from "../../groups/stats"
import {
   getAValidLivestreamStatsUpdateField,
   NestedObjectOptions,
} from "../../livestreams/stats"

describe("getPropertyToUpdate", () => {
   it("should return the correct property path for a general stat", () => {
      const field = "numberOfRegistrations"
      const result = getAValidGroupStatsUpdateField(field)
      expect(result).toEqual("generalStats.numberOfRegistrations")
   })

   it("should return the correct property path for a university stat", () => {
      const field = "numberOfRegistrations"
      const universityCode = "12345"
      const result = getAValidGroupStatsUpdateField(field, universityCode)
      expect(result).toEqual("universityStats.12345.numberOfRegistrations")
   })

   it("Expect typescript error for invalid Group Stats field key", () => {
      const field = "invalidField"
      const universityCode = "ucl"
      // @ts-expect-error
      const result = getAValidGroupStatsUpdateField(field, universityCode)

      expect(result).toEqual("universityStats.ucl.invalidField")
   })
})

describe("getAValidLivestreamStatsUpdateField", () => {
   it("should return a valid field path for general stats", () => {
      const field = "numberOfRegistrations"
      const result = getAValidLivestreamStatsUpdateField(field)
      expect(result).toBe(`generalStats.${field}`)
   })

   it("should return a valid field path for university stats", () => {
      const field = "numberOfRegistrations"
      const options: NestedObjectOptions = {
         statsObjectKey: "universityStats",
         statsObjectProperty: "universityCode123",
      }
      const result = getAValidLivestreamStatsUpdateField(field, options)
      expect(result).toBe(
         `universityStats.${options.statsObjectProperty}.${field}`
      )
   })

   it("should return a valid field path for field of study stats", () => {
      const field = "numberOfRegistrations"
      const options: NestedObjectOptions = {
         statsObjectKey: "fieldOfStudyStats",
         statsObjectProperty: "fieldOfStudyId123",
      }
      const result = getAValidLivestreamStatsUpdateField(field, options)
      expect(result).toBe(
         `fieldOfStudyStats.${options.statsObjectProperty}.${field}`
      )
   })

   it("should return a valid field path for country stats", () => {
      const field = "numberOfRegistrations"
      const options: NestedObjectOptions = {
         statsObjectKey: "countryStats",
         statsObjectProperty: "countryCode123",
      }
      const result = getAValidLivestreamStatsUpdateField(field, options)
      expect(result).toBe(
         `countryStats.${options.statsObjectProperty}.${field}`
      )
   })
})
