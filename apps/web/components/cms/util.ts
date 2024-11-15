import { CompanyCaseStudy, CompanyCaseStudyPreview } from "../../types/cmsTypes"

export const parseCaseStudy = ({
   published,
   ...caseStudy
}: CompanyCaseStudy | CompanyCaseStudyPreview):
   | CompanyCaseStudy
   | CompanyCaseStudyPreview => ({
   ...caseStudy,
   ...(published && {
      published,
      formattedPublished: new Intl.DateTimeFormat("en-US", {
         weekday: "long",
         year: "numeric",
         month: "long",
         day: "numeric",
      }).format(new Date(published)),
   }),
})
interface GraphCMSImageLoaderProps {
   src: string
   width: number
}
export const GraphCMSImageLoader = ({
   src,
   width,
}: GraphCMSImageLoaderProps) => {
   const relativeSrc = (src: string) => src.split("/").pop()
   return `https://media.graphcms.com/resize=width:${width}/${relativeSrc(src)}`
}

export const parseIndustryTag = (industryTag: string) => {
   return industryTag
      .split("_")
      .join(" ")
      .toLowerCase()
      .replace(/\b(\w)/g, (s) => s.toUpperCase())
}
