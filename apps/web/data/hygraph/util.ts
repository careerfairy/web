type HygraphImageLoaderProps = {
   src: string
   width: number
}

export const HygraphImageLoader = ({ src, width }: HygraphImageLoaderProps) => {
   const relativeSrc = (src: string) => src.split("/").pop()
   const url = `https://media.graphassets.com/resize=width:${width}/${relativeSrc(
      src
   )}`

   return url
}
