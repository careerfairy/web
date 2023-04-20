import { Avatar, Box, IconButton, Typography } from "@mui/material"
import { Testimonial } from "@careerfairy/shared-lib/groups"
import { sxStyles } from "../../../../types/commonTypes"
import React from "react"
import { useCompanyPage } from "../index"
import { Edit2 as EditIcon } from "react-feather"
import useIsMobile from "../../../custom-hook/useIsMobile"

type Props = {
   testimonial: Testimonial
   handleEditTestimonial: (testimonial) => void
}

const styles = sxStyles({
   wrapper: {
      position: "relative",

      "&:not(:last-child)": {
         mb: 4,
      },
   },
   titleSection: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      background: "#FDFDFD",
      minHeight: "80px",
      px: 4,
      borderRadius: "12px 12px 0 0",
      border: "1px solid #EDE7FD",
      borderBottom: "none",
   },
   testimonial: {
      p: 4,
      border: "1px solid #EDE7FD",
      borderTop: "none",
      borderRadius: "0 0 12px 12px",
      background: "white",
   },
   avatar: {
      width: (theme) => ({ xs: theme.spacing(8), md: theme.spacing(12) }),
      height: (theme) => ({ xs: theme.spacing(8), md: theme.spacing(12) }),
   },
   avatarRing: {
      borderRadius: "50%",
      border: "2px solid",
      borderColor: (theme) => theme.palette.primary.main,
      padding: (theme) => theme.spacing(1),
   },
   avaWrapper: {
      position: "absolute",
      top: "20px",
      right: "20px",
   },
   editIconWrapper: {
      position: "absolute",
      zIndex: 1,
      right: 0,
   },
   editIconButton: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      bgcolor: "rgba(0, 0, 0, 0.5)",

      svg: {
         color: "white",
         fill: "white",
      },

      "&:hover": {
         bgcolor: "rgba(0, 0, 0, 0.7)",
      },
   },
})

const TestimonialCard = ({ testimonial, handleEditTestimonial }: Props) => {
   const { editMode } = useCompanyPage()
   const isMobile = useIsMobile()

   const { avatar, name, position, testimonial: description } = testimonial

   return (
      <Box sx={styles.wrapper}>
         <Box sx={styles.titleSection}>
            <Typography variant={"h6"} fontWeight={"bold"}>
               {name}
            </Typography>
            <Typography variant={"body1"}>{position}</Typography>
         </Box>

         <Box sx={styles.avaWrapper}>
            {editMode ? (
               <Box sx={styles.editIconWrapper}>
                  <IconButton
                     sx={styles.editIconButton}
                     onClick={() => {
                        handleEditTestimonial(testimonial)
                     }}
                  >
                     <EditIcon size={isMobile ? 14 : 18} />
                  </IconButton>
               </Box>
            ) : null}
            <Box sx={styles.avatarRing} boxShadow={3}>
               <Box
                  component={Avatar}
                  src={avatar}
                  sx={styles.avatar}
                  alt={"testimonialAvatar"}
               />
            </Box>
         </Box>

         <Box sx={styles.testimonial}>
            <Box width={"80%"} mb={2}>
               <Typography
                  variant={"body1"}
                  fontWeight={400}
                  color={"text.secondary"}
               >
                  {description}
               </Typography>
            </Box>
         </Box>
      </Box>
   )
}

export default TestimonialCard
