import { ValidationObject } from "."

type Dimensions = {
   minWidth?: number
   minHeight?: number
   maxWidth?: number
   maxHeight?: number
}

export const getImageDimensionsValidator = ({
   minWidth,
   minHeight,
   maxWidth,
   maxHeight,
}: Dimensions): ValidationObject => {
   return {
      validation: (file: File) => {
         return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
               let errorMessage = ""
               if (minWidth && img.width < minWidth) {
                  errorMessage += `Width is less than minimum width ${minWidth}. Current width is ${img.width}. `
               }
               if (minHeight && img.height < minHeight) {
                  errorMessage += `Height is less than minimum height ${minHeight}. Current height is ${img.height}. `
               }
               if (maxWidth && img.width > maxWidth) {
                  errorMessage += `Width is greater than maximum width ${maxWidth}. Current width is ${img.width}. `
               }
               if (maxHeight && img.height > maxHeight) {
                  errorMessage += `Height is greater than maximum height ${maxHeight}. Current height is ${img.height}. `
               }
               if (errorMessage) {
                  reject(errorMessage.trim())
               } else {
                  resolve(true)
               }
            }
            img.src = URL.createObjectURL(file)
         })
      },
   }
}
