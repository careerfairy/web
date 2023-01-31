import { getAValidGroupStatsUpdateField } from "../../groups/stats"
import { getAValidLivestreamStatsUpdateField } from "../../livestreams/stats"

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

   it("Expect typescript error for invalid Live Stream Stats field key", () => {
      const field = "invalidField"
      const universityCode = "ucl"
      // @ts-expect-error
      const result = getAValidLivestreamStatsUpdateField(field, universityCode)

      expect(result).toEqual("universityStats.ucl.invalidField")
   })

   it("Expect typescript error for invalid Group Stats field key", () => {
      const field = "invalidField"
      const universityCode = "ucl"
      // @ts-expect-error
      const result = getAValidGroupStatsUpdateField(field, universityCode)

      expect(result).toEqual("universityStats.ucl.invalidField")
   })
})
