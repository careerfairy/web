import { Avatar, Rating, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import { quoteBackgroundLightPink } from "../../../constants/images"
import { Person } from "../../../types/cmsTypes"
import React, { useCallback } from "react"
import useIsMobile from "../../custom-hook/useIsMobile"

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
   background: {
      paddingY: 10,
      background: `url(${quoteBackgroundLightPink}) no-repeat`,
      backgroundSize: { md: "90vw", lg: "70vw", xl: "60vw" },
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   avatar: {
      width: (theme) => theme.spacing(10),
      height: (theme) => theme.spacing(10),
   },
})

const Testimonial = ({
   title,
   content,
   rating,
   person,
}: Props): JSX.Element => {
   const isQuote = title && !content && !rating
   const isMobile = useIsMobile()

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
               <Typography
                  variant={isMobile ? "h4" : "h2"}
                  lineHeight={1.5}
                  textAlign="center"
                  pb={2}
               >
                  {title}
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
               <Typography
                  variant={isMobile ? "h6" : "h4"}
                  ml={2}
                  alignSelf="end"
               >
                  {name}, {role}
               </Typography>
            </Box>
         </>
      )
   }, [isMobile, person, title])

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
            {content ? (
               <Typography variant="body1" marginY={3}>
                  {content}
               </Typography>
            ) : null}
            {rating ? (
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
            ) : null}
         </>
      )
   }, [content, isQuote, rating, title])

   return (
      <Box
         sx={{
            ...styles.background,
            height: isQuote
               ? { xs: "100%", xl: "60vh" }
               : { xs: "100%", md: "70vh" },
         }}
      >
         <Box
            sx={{
               height: "fit-content",
               maxWidth: isQuote
                  ? { xs: "80vw", md: "70vw", xl: "60vw" }
                  : { xs: "80vw", md: "60vw", lg: "50vw" },
            }}
         >
            {isQuote ? renderQuote() : renderSimpleTestimonial()}
         </Box>
      </Box>
   )
}

export default Testimonial
