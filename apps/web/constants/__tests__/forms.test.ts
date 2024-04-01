import { videoUrlRegex } from "@careerfairy/shared-lib/constants/forms"

const isVideoUrlValid = (url: string): boolean => {
   return videoUrlRegex.test(url)
}
describe("isVideoUrlValid", () => {
   it("should return true for valid YouTube URLs", () => {
      expect(
         isVideoUrlValid("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe(true)
      expect(isVideoUrlValid("http://youtu.be/dQw4w9WgXcQ")).toBe(true)
   })

   it("should return true for valid Vimeo URLs", () => {
      expect(isVideoUrlValid("https://vimeo.com/123456789")).toBe(true)
   })

   it("should return true for valid Dailymotion URLs", () => {
      expect(isVideoUrlValid("https://www.dailymotion.com/video/x7tgxmr")).toBe(
         true
      )
   })

   it("should return true for valid Twitch URLs", () => {
      expect(isVideoUrlValid("https://www.twitch.tv/videos/123456789")).toBe(
         true
      )
   })

   it("should return true for valid Firebase Storage URLs", () => {
      expect(
         isVideoUrlValid("http://firebasestorage.googleapis.com/myfile.mp4")
      ).toBe(true)
   })

   it("should return true for valid localhost URLs", () => {
      expect(isVideoUrlValid("http://localhost:3000/video")).toBe(true)
   })

   it("should return false for invalid URLs", () => {
      expect(isVideoUrlValid("http://example.com/video")).toBe(false)
      expect(isVideoUrlValid("https://www.google.com/search?q=youtube")).toBe(
         false
      )
   })
})
