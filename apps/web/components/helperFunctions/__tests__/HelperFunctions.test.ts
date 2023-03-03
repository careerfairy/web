import { getResizedUrl } from "../HelperFunctions"

const imageUrl =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2F871bc1f4-1327-4340-af44-f8a4c2da6772.png?alt=media"

const imageUrlNoExtension =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2F871bc1f4-1327-4340-af44-f8a4c2da6772?alt=media"

test("Correct image size with extension", () => {
   expect(getResizedUrl(imageUrl, "lg")).toMatch(/72_1200x900.png\?alt=media$/)
   expect(getResizedUrl(imageUrl, "md")).toMatch(/72_680x680.png\?alt=media$/)
})

test("Correct image size without extension", () => {
   expect(getResizedUrl(imageUrlNoExtension, "lg")).toContain(
      "72_1200x900?alt=media"
   )
   expect(getResizedUrl(imageUrlNoExtension, "sm")).toContain(
      "72_400x400?alt=media"
   )
})

test("Returns received url", () => {
   const url = "https://google.com"
   expect(getResizedUrl(url, "lg")).toBe(url)
})
