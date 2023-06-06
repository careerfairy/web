import { makeLivestreamEventDetailsUrl } from "../urls"

describe("uorrectly generate urls", () => {
   it("should return the correct URL with default section", () => {
      const livestreamId = "123"
      const expectedUrl = `https://careerfairy.io/portal/livestream/${livestreamId}`
      const actualUrl = makeLivestreamEventDetailsUrl(livestreamId)

      expect(actualUrl).toEqual(expectedUrl)
   })

   it("should return the correct URL with provided section", () => {
      const livestreamId = "456"
      const section = "custom"
      const expectedUrl = `https://careerfairy.io/${section}/livestream/${livestreamId}`
      const actualUrl = makeLivestreamEventDetailsUrl(livestreamId, section)

      expect(actualUrl).toEqual(expectedUrl)
   })
})
