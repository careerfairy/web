import { CompanyCaseStudy, CompanyCaseStudyPreview } from "../../types/cmsTypes"
import { StarIcon } from "../icons/StarIcon"
import React from "react"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"

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

/**
 * Get rating stars Elements
 * It will fill in the stars based on the received rating (0 to 5)
 */
export const getStars = (rating: number, isSmall = false): JSX.Element => {
   const maxStars = 5

   // get start components filled depending
   const starts = Array(maxStars)
      .fill(null)
      .map((item, index) => {
         const isFilled = index < Math.round(rating)
         const smallClasses = isSmall ? { height: 18, width: 20 } : {}

         return (
            <StarIcon
               key={`star-${index}`}
               sx={{ marginRight: 1, ...smallClasses }}
               filled={isFilled}
               color={isFilled ? "primary" : "inherit"}
            />
         )
      })

   return (
      <Box display="flex">
         {starts}
         {!isSmall && (
            <Typography variant="h4" color="primary" ml={1}>
               {rating}
            </Typography>
         )}
      </Box>
   )
}
