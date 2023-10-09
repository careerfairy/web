import { collectionsForEmulatorImport } from "../collections"

describe("collectionsForEmulatorImport", () => {
   // For the fetch-firestore-data package, we want to make sure that the
   // number of collections is less than 60 since that is the maximum
   it("should have a length less than or equal to 60", () => {
      expect(collectionsForEmulatorImport.length).toBeLessThanOrEqual(60)
   })
})
