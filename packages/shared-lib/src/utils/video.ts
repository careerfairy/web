type TransformationParams = {
   src: string
   width: number
   height: number
   /**
    * Quality of the image. Default is 50.
    */
   quality?: number
   aspectRatio?: { width: number; height: number }
   maxSizeCrop?: boolean
   format?: "auto" | "mp4" | "webm"
}

export const imageKitLoader = (params: TransformationParams) => {
   let { src, width, height, quality, aspectRatio, maxSizeCrop, format } =
      params

   // Replace the Firebase base URL with ImageKit base URL
   const firebaseBaseUrl = "https://firebasestorage.googleapis.com"
   const imageKitBaseUrl = `https://ik.imagekit.io/${process.env.NEXT_PUBLIC_IMAGEKIT_ID}`
   src = src.replace(firebaseBaseUrl, imageKitBaseUrl)

   const transformations = []

   if (aspectRatio) {
      transformations.push(`ar-${aspectRatio.width}-${aspectRatio.height}`)
      // If aspectRatio is provided, only add width to transformations
      transformations.push(`w-${height}`)
   } else {
      // If aspectRatio is not provided, add both width and height to transformations
      transformations.push(`w-${width}`, `h-${height}`)
   }

   if (quality) {
      transformations.push(`q-${quality}`)
   }

   // If maxSizeCrop is true, add 'c-at_max' to transformations
   if (maxSizeCrop) {
      transformations.push("c-at_max")
   }

   if (format) {
      transformations.push(`f-${format}`)
   }

   const paramsString = transformations.join(",")

   // Ensure no trailing slash in the base URL
   if (src[src.length - 1] === "/") src = src.substring(0, src.length - 1)

   // Insert the transformations into the URL path
   const urlParts = src.split("/")

   urlParts.splice(4, 0, `tr:${paramsString}`)

   return urlParts.join("/")
}
