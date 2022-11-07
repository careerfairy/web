import { Avatar, Rating, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import { quoteBackgroundLightPink } from "../../../constants/images"
import { Person } from "../../../types/cmsTypes"
import React, { useCallback } from "react"

type Props = {
   title: string
   content: string
   rating: number
   person: Person
}

const styles = sxStyles({
   stars: {
      color: (theme) => theme.palette.primary.main,
   },
   wrapper: {
      paddingTop: 10,
      maxWidth: { xs: "80vw", lg: "60vw" },
      height: "fit-content",
   },
   background: {
      background: `url(${quoteBackgroundLightPink}) no-repeat`,
      backgroundSize: { md: "90vw", lg: "70vw", xl: "60vw" },
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   avatar: {
      width: (theme) => theme.spacing(6),
      height: (theme) => theme.spacing(6),
   },
})

const Testimonial = ({
   title,
   content,
   rating,
   person,
}: Props): JSX.Element => {
   const isQuote = title && !content && !rating

   const renderQuote = useCallback(() => {
      const { name, role, photo } = person

      return (
         <>
            <Box mt={12}>
               <Typography
                  variant="h1"
                  fontSize={"100px !important"}
                  lineHeight={0}
               >{`"`}</Typography>
               <Typography variant="h2" lineHeight={1.5} textAlign="center">
                  I love watching live streams, especially seeing people from
                  other teams, not just recruiters. It helped me to choose the
                  best companies I applied to work for. I am pretty confident
                  one of them will hire me.{" "}
               </Typography>
               <Typography
                  variant="h1"
                  fontSize={"100px !important"}
                  textAlign="end"
                  lineHeight={0.6}
               >{`"`}</Typography>
            </Box>
            <Box display="flex">
               <Avatar
                  src={photo?.url}
                  alt={`${name} avatar`}
                  sx={styles.avatar}
               />
               <Typography variant="h5" ml={2} alignSelf="end">
                  {name}, {role}
               </Typography>
            </Box>
         </>
      )
   }, [person])

   const renderSimpleTestimonial = useCallback(() => {
      return (
         <>
            <Typography
               variant="h2"
               lineHeight={1.5}
               textAlign={isQuote ? "center" : "unset"}
            >
               {title}
            </Typography>
            {content && (
               <Typography variant="body1" marginY={3}>
                  {content}
               </Typography>
            )}
            {rating && (
               <Box display={"flex"}>
                  <Rating
                     readOnly
                     name={"testimonial-rating"}
                     value={Number(rating)}
                     precision={0.5}
                     size="large"
                     sx={styles.stars}
                  />
                  <Typography variant="h5" ml={1} alignSelf="flex-end">
                     {rating}
                  </Typography>
               </Box>
            )}
         </>
      )
   }, [content, isQuote, rating, title])

   return (
      <Box
         sx={{
            ...styles.background,
            height: isQuote
               ? { xs: "100%", xl: "60vh" }
               : { xs: "100%", md: "60vh" },
         }}
      >
         <Box sx={styles.wrapper}>
            {isQuote ? renderQuote() : renderSimpleTestimonial()}
         </Box>
      </Box>
   )
}

export default Testimonial
