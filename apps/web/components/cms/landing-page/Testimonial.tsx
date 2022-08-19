import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import React, { useCallback } from "react"
import { StarIcon } from "../../icons/StarIcon"

type Props = {
   title: string
   content: string
   rating: number
   published: string
}

const Testimonial = ({
   title,
   content,
   rating,
   published,
}: Props): JSX.Element => {
   /**
    * To handle the rendering of the rating stars and determine whether they are filled
    */
   const renderRating = useCallback((rating) => {
      const maxStars = 5

      const starts = Array(maxStars)
         .fill(null)
         .map((item, index) => {
            const isFilled = index < Math.round(rating)
            return (
               <StarIcon
                  key={`star-${index}`}
                  sx={{ marginRight: 1 }}
                  filled={isFilled}
                  color={isFilled ? "primary" : "inherit"}
               />
            )
         })

      return (
         <Box display="flex">
            {starts}
            <Typography variant="h4" color="primary" ml={1}>
               {rating}
            </Typography>
         </Box>
      )
   }, [])

   return (
      <Box paddingY={6} marginX={{ xs: 4, md: 10, lg: 36, xl: 62 }}>
         <Typography variant="h1">{title}</Typography>
         {content && (
            <Typography variant="body1" marginY={3}>
               {content}
            </Typography>
         )}
         {rating && renderRating(rating)}
      </Box>
   )
}

export default Testimonial
