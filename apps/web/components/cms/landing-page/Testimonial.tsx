import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import React, { useCallback } from "react"
import { getStars } from "../util"

type Props = {
   title: string
   content: string
   rating: number
}

const Testimonial = ({ title, content, rating }: Props): JSX.Element => {
   /**
    * To handle the rendering of the rating stars and determine whether they are filled
    */
   const renderRating = useCallback((rating) => {
      return getStars(rating)
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
