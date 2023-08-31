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
   let {
      src,
      width,
      height,
      quality,
      aspectRatio,
      maxSizeCrop,
      format = "mp4",
   } = params

   // Replace the Firebase base URL with ImageKit base URL
   const firebaseBaseUrl = "https://firebasestorage.googleapis.com"
   const imageKitBaseUrl = `https://ik.imagekit.io/${process.env.NEXT_PUBLIC_IMAGEKIT_ID}`
   src = src.replace(firebaseBaseUrl, imageKitBaseUrl)

   const transformations = [`w-${width}`, `h-${height}`]

   if (quality) {
      transformations.push(`q-${quality}`)
   }

   // If aspectRatio is provided, add it to transformations
   if (aspectRatio) {
      transformations.push(`ar-${aspectRatio.width}-${aspectRatio.height}`)
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

   return `${src}?tr=${paramsString}`
}
