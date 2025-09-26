import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   section: {
      width: "100%",
      padding: 1.5, // 12px
   },
   ctaContainer: (theme) => ({
      backgroundColor: theme => theme.brand.black[900] || "#0D212C",
      borderRadius: "24px",
      padding: 4, // 32px
      width: "100%",
      height: "344px",
      display: "flex",
      flexDirection: "row",
      gap: 3, // 24px
      [theme.breakpoints.down("md")]: {
         padding: 2, // 16px
         flexDirection: "column",
         gap: 1.5, // 12px
         height: "auto",
      },
   }),
   textContent: (theme) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      flex: 1,
      [theme.breakpoints.down("md")]: {
         order: 2,
      },
   }),
   heading: (theme) => ({
      color: theme => theme.brand.white[50],
      fontWeight: 700,
      marginBottom: 2,
   }),
   paragraph: (theme) => ({
      color: theme => theme.brand.white[50],
      fontWeight: 400,
      marginBottom: 3,
   }),
   button: {
      backgroundColor: "primary.main", // Turquoise
      color: "common.white",
      textTransform: "none",
      "&:hover": {
         backgroundColor: "primary.dark",
      },
   },
   image: (theme) => ({
      height: "100%",
      width: "auto",
      objectFit: "contain",
      borderRadius: "12px",
      [theme.breakpoints.down("md")]: {
         order: 1,
         height: "200px",
         width: "100%",
         objectFit: "cover",
      },
   }),
})

interface RegisterNowSectionConsultingProps {
   headerIdToScrollTo?: string
}

export default function RegisterNowSectionConsulting({
   headerIdToScrollTo = "header"
}: RegisterNowSectionConsultingProps) {
   const handleExploreClick = () => {
      const headerElement = document.getElementById(headerIdToScrollTo)
      if (headerElement) {
         headerElement.scrollIntoView({ 
            behavior: "smooth",
            block: "start"
         })
      }
   }

   return (
      <Box sx={styles.section}>
         <Box id="CTA Container" sx={styles.ctaContainer}>
            <Box id="Text content" sx={styles.textContent}>
               <Typography variant="brandedH3" sx={styles.heading}>
                  Don't miss your chance!
               </Typography>
               <Typography variant="brandedBody" sx={styles.paragraph}>
                  Get one step closer to your dream job by exploring the live streams available.
               </Typography>
               <Button 
                  variant="contained" 
                  size="medium"
                  sx={styles.button}
                  onClick={handleExploreClick}
               >
                  Explore live streams
               </Button>
            </Box>
            <Box
               component="img"
               src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/consulting_page_explore_more_image.png?alt=media&token=453f0eb2-94ff-4029-b99e-835abe5b0a65"
               alt="Consulting page explore more"
               sx={styles.image}
            />
         </Box>
      </Box>
   )
}