import {
   getHost,
   makeLivestreamEventDetailsUrl,
   makeLivestreamGroupEventDetailsUrl,
} from "../urls"

describe("should correctly generate urls", () => {
   it("should return the correct URL with default section", () => {
      const livestreamId = "123"
      const expectedUrl = `https://careerfairy.io/portal/livestream/${livestreamId}`
      const actualUrl = makeLivestreamEventDetailsUrl(livestreamId)

      expect(actualUrl).toEqual(expectedUrl)
   })

   it("should return the correct URL with portal section, relative false and livestream ID", () => {
      const livestreamId = "123"
      const result = makeLivestreamEventDetailsUrl(livestreamId, {
         relative: false,
      })
      expect(result).toBe(`${getHost()}/portal/livestream/123`)
   })

   it("should return the correct URL with portal section, relative true and livestream ID", () => {
      const livestreamId = "123"
      const result = makeLivestreamEventDetailsUrl(livestreamId, {
         relative: true,
      })
      expect(result).toBe(`/portal/livestream/123`)
   })

   it("should return the correct URL with custom section and livestream ID", () => {
      const livestreamId = "123"
      const result = makeLivestreamEventDetailsUrl(livestreamId, {
         section: "next-livestreams",
         relative: true,
      })
      expect(result).toBe("/next-livestreams/livestream/123")
   })

   it("should return the correct URL with custom section, relative false and livestream ID", () => {
      const livestreamId = "123"
      const result = makeLivestreamEventDetailsUrl(livestreamId, {
         section: "next-livestreams",
      })
      expect(result).toBe(`${getHost()}/next-livestreams/livestream/123`)
   })

   it("returns the correct URL with valid group input", () => {
      const groupId = "123"
      const livestreamId = "456"
      const expectedUrl = `${getHost()}/next-livestreams/group/${groupId}/livestream/${livestreamId}`

      const result = makeLivestreamGroupEventDetailsUrl(groupId, livestreamId)

      expect(result).toEqual(expectedUrl)
   })
})
