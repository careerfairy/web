import { inLocation } from "@careerfairy/shared-lib/countries/types"

describe("inLocation", () => {
   it("returns all ids in the same country hierarchy", () => {
      expect(inLocation("CH", ["CH-FR", "CH", "PT"])).toEqual(["CH-FR", "CH"])
      expect(inLocation("PT", ["CH-FR", "CH", "PT"])).toEqual(["PT"])
   })

   it("returns all ids in the same state hierarchy", () => {
      expect(
         inLocation("CH-FR", ["CH-FR", "CH", "CH-ZG", "CH-FR-Villars"])
      ).toEqual(["CH-FR", "CH-FR-Villars"])
      expect(
         inLocation("CH-ZG", [
            "CH-FR",
            "CH",
            "CH-ZG",
            "CH-FR-Villars",
            "CH-ZG-Zug",
         ])
      ).toEqual(["CH-ZG", "CH-ZG-Zug"])
   })

   it("returns all ids in the same city hierarchy", () => {
      expect(
         inLocation("CH-FR-Villars", [
            "CH-FR",
            "CH-FR-Villars",
            "CH-FR-Fribourg",
            "CH-FR-Villars-sur-Glane",
         ])
      ).toEqual(["CH-FR-Villars"])
   })

   it("returns empty array if no matches", () => {
      expect(
         inLocation("CH-FR-Villars", ["PT", "CH-ZG", "CH-FR-Fribourg"])
      ).toEqual([])
   })

   it("handles empty input array", () => {
      expect(inLocation("CH", [])).toEqual([])
   })

   it("handles ids with different depths", () => {
      expect(inLocation("CH", ["CH-FR-Villars", "CH-FR", "CH"])).toEqual([
         "CH-FR-Villars",
         "CH-FR",
         "CH",
      ])
      expect(inLocation("CH-FR", ["CH-FR-Villars", "CH-FR", "CH"])).toEqual([
         "CH-FR-Villars",
         "CH-FR",
      ])
      expect(
         inLocation("CH-FR-Villars", ["CH-FR-Villars", "CH-FR", "CH"])
      ).toEqual(["CH-FR-Villars"])
   })
})
