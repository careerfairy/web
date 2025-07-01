import {
   inLocation,
   normalizeLocationIds,
   normalizeLocationIdsForFiltering,
} from "@careerfairy/shared-lib/countries/types"

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

describe("normalizeLocationIds", () => {
   it("returns all normalized ids for countries", () => {
      expect(normalizeLocationIds(["US"]).sort()).toEqual(["Country_US"])
      expect(normalizeLocationIds(["CH", "PT"]).sort()).toEqual([
         "Country_CH",
         "Country_PT",
      ])
   })

   it("returns all normalized ids for states", () => {
      expect(normalizeLocationIds(["US-CA"]).sort()).toEqual([
         "Country_US",
         "Country_US_State_CA",
      ])
      expect(normalizeLocationIds(["CH-FR", "PT-LI"]).sort()).toEqual([
         "Country_CH",
         "Country_CH_State_FR",
         "Country_PT",
         "Country_PT_State_LI",
      ])
   })

   it("returns all normalized ids for cities", () => {
      expect(normalizeLocationIds(["US-CA-San Francisco"]).sort()).toEqual([
         "Country_US",
         "Country_US_State_CA",
         "Country_US_State_CA_City_San Francisco",
      ])
      expect(
         normalizeLocationIds(["CH-FR-Fribourg", "PT-LI-Lisbon"]).sort()
      ).toEqual([
         "Country_CH",
         "Country_CH_State_FR",
         "Country_CH_State_FR_City_Fribourg",
         "Country_PT",
         "Country_PT_State_LI",
         "Country_PT_State_LI_City_Lisbon",
      ])
   })

   it("removes duplicates", () => {
      expect(
         normalizeLocationIds(["US-CA-San Francisco", "US-CA", "US"]).sort()
      ).toEqual([
         "Country_US",
         "Country_US_State_CA",
         "Country_US_State_CA_City_San Francisco",
      ])
   })

   it("handles empty input", () => {
      expect(normalizeLocationIds([])).toEqual([])
   })
})

describe("normalizeLocationIdsForFiltering", () => {
   it("returns highest precision id for countries", () => {
      expect(normalizeLocationIdsForFiltering(["US"]).sort()).toEqual([
         "Country_US",
      ])
      expect(normalizeLocationIdsForFiltering(["CH", "PT"]).sort()).toEqual([
         "Country_CH",
         "Country_PT",
      ])
   })

   it("returns highest precision id for states", () => {
      expect(normalizeLocationIdsForFiltering(["US-CA"]).sort()).toEqual([
         "Country_US_State_CA",
      ])
      expect(
         normalizeLocationIdsForFiltering(["CH-FR", "PT-LI"]).sort()
      ).toEqual(["Country_CH_State_FR", "Country_PT_State_LI"])
   })

   it("returns highest precision id for cities", () => {
      expect(
         normalizeLocationIdsForFiltering(["US-CA-San Francisco"]).sort()
      ).toEqual(["Country_US_State_CA_City_San Francisco"])
      expect(
         normalizeLocationIdsForFiltering([
            "CH-FR-Fribourg",
            "PT-LI-Lisbon",
         ]).sort()
      ).toEqual([
         "Country_CH_State_FR_City_Fribourg",
         "Country_PT_State_LI_City_Lisbon",
      ])
   })

   it("multiple locations", () => {
      expect(
         normalizeLocationIdsForFiltering([
            "US-CA-San Francisco",
            "US-CA",
            "US",
         ]).sort()
      ).toEqual([
         "Country_US",
         "Country_US_State_CA",
         "Country_US_State_CA_City_San Francisco",
      ])
   })

   it("removes duplicates", () => {
      expect(
         normalizeLocationIdsForFiltering([
            "US-CA-San Francisco",
            "US-CA",
            "US",
            "US",
            "US-CA",
         ]).sort()
      ).toEqual([
         "Country_US",
         "Country_US_State_CA",
         "Country_US_State_CA_City_San Francisco",
      ])
   })

   it("handles empty input", () => {
      expect(normalizeLocationIdsForFiltering([])).toEqual([])
   })
})
