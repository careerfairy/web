import { Avatar, Box, Button, Typography } from "@mui/material"
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
   titleSection: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      background: "#F7F7F7",
      minHeight: "80px",
      px: 4,
   },
   testimonial: {
      p: 4,
      border: "1px solid #EDE7FD",
      borderTop: "none",
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
   },
})

const TestimonialCard = ({ testimonial, handleEditTestimonial }: Props) => {
   const { editMode } = useCompanyPage()
   const isMobile = useIsMobile()

   const { avatar, name, position, testimonial: description } = testimonial

   return (
      <Box mb={4} position={"relative"}>
         <Box sx={styles.titleSection}>
            <Typography variant={"h6"} fontWeight={"bold"}>
               {name}
            </Typography>
            <Typography variant={"body1"}>{position}</Typography>
         </Box>

         <Box sx={styles.avaWrapper}>
            {editMode ? (
               <Box sx={styles.editIconWrapper}>
                  <Button
                     variant="contained"
                     color="secondary"
                     sx={styles.editIconButton}
                     onClick={() => {
                        handleEditTestimonial(testimonial)
                     }}
                  >
                     <EditIcon size={isMobile ? 14 : 18} />
                  </Button>
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
