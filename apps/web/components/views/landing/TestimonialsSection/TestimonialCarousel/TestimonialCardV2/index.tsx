import React, { memo, useCallback } from "react"
import { Avatar, Box, Card, Typography } from "@mui/material"
import { Person } from "../../../../../../types/cmsTypes"
import { sxStyles } from "../../../../../../types/commonTypes"
import { getStars } from "../../../../../cms/util"
import DateUtil from "../../../../../../util/DateUtil"

const styles = sxStyles({
   card: {
      display: "flex",
      borderRadius: 3,
      flexWrap: "wrap",
      justifyContent: { xs: "start", md: "center" },
      padding: { xs: 2, md: 5 },
      boxShadow: "none",
   },
})

const TestimonialCardV2 = ({ person, content, rating, published }: Props) => {
   const renderRating = useCallback((rating) => {
      return getStars(rating, true)
   }, [])

   return (
      <Card sx={styles.card}>
         <Box>
            <Box>
               <Avatar
                  src={person?.photo?.url}
                  alt={`${person?.name} avatar`}
                  sx={{ mb: 2 }}
               />

               {renderRating(rating)}

               <Typography variant="body2" sx={{ mt: 2 }}>
                  {person?.name}, {DateUtil.getRatingDate(published)}
               </Typography>
            </Box>
            <Box mt={1}>
               <Typography variant="h6">{`"${content || ""}"`}</Typography>
            </Box>
         </Box>
      </Card>
   )
}

type Props = {
   content?: string
   person?: Person
   rating?: number
   published?: Date
   key: string
}
export default memo(TestimonialCardV2)
