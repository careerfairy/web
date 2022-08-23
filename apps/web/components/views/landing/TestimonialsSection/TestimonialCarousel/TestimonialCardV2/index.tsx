import React, { memo } from "react"
import { Avatar, Box, Card, Rating, Typography } from "@mui/material"
import { Person } from "../../../../../../types/cmsTypes"
import { sxStyles } from "../../../../../../types/commonTypes"
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
   stars: {
      color: (theme) => theme.palette.primary.main,
   },
})

const TestimonialCardV2 = ({ person, content, rating, published }: Props) => {
   return (
      <Card sx={styles.card}>
         <Box>
            <Box>
               <Avatar
                  src={person?.photo?.url}
                  alt={`${person?.name} avatar`}
                  sx={{ mb: 2 }}
               />

               {rating && (
                  <Rating
                     readOnly
                     name={"testimonial-rating"}
                     value={Number(rating)}
                     precision={0.5}
                     size="medium"
                     sx={styles.stars}
                  />
               )}

               <Typography variant="body2">
                  {person?.name}, {DateUtil.getRatingDate(published)}
               </Typography>
            </Box>
            <Box mt={1}>
               <Typography variant="h6">{content && `"${content}"`}</Typography>
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
