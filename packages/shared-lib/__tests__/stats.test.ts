import { getPropertyToUpdate } from "../src/livestreams/stats"

describe("getPropertyToUpdate", () => {
   it("should return the correct property path for a general stat", () => {
      const field = "numberOfRegistrations"
      const result = getPropertyToUpdate(field)
      expect(result).toEqual("generalStats.numberOfRegistrations")
   })

   it("should return the correct property path for a university stat", () => {
      const field = "numberOfRegistrations"
      const universityCode = "ucl"
      const result = getPropertyToUpdate(field, universityCode)
      expect(result).toEqual("universityStats.ucl.numberOfRegistrations")
   })
})
