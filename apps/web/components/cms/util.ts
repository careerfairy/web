export const parseCaseStudy = ({ published, ...caseStudy }) => ({
   ...(published && {
      formattedPublished: new Intl.DateTimeFormat("en-US", {
         weekday: "long",
         year: "numeric",
         month: "long",
         day: "numeric",
      }).format(new Date(published)),
   }),
   ...caseStudy,
})
interface GraphCMSImageLoaderProps {
   src: string
   width: number
}
export const GraphCMSImageLoader = ({
   src,
   width,
}: GraphCMSImageLoaderProps) => {
   const relativeSrc = (src) => src.split("/").pop()
   return `https://media.graphcms.com/resize=width:${width}/${relativeSrc(src)}`
}

export const parseIndustryTag = (industryTag: string) => {
   return industryTag
      .split("_")
      .join(" ")
      .toLowerCase()
      .replace(/\b(\w)/g, (s) => s.toUpperCase())
}
