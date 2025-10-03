import { Box, Button, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/image"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   fullWidthSection: {
      padding: "12px",
      width: "100%",
   },
   ctaContainer: {
      backgroundColor: "#0D212C",
      borderRadius: "24px",
      padding: { xs: "16px", md: "32px" },
      width: "100%",
      height: { xs: "auto", md: "344px" },
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: { xs: "12px", md: "24px" },
      alignItems: "center",
   },
   textContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: { xs: "center", md: "flex-start" },
      textAlign: { xs: "center", md: "left" },
      gap: 2,
      flex: { md: "1 1 auto" },
      order: { xs: 2, md: 1 },
   },
   heading: {
      color: (theme) => theme.brand.white[50],
      fontWeight: 700,
      fontSize: { xs: "24px", md: "32px" },
      lineHeight: { xs: "32px", md: "40px" },
   },
   paragraph: {
      color: (theme) => theme.brand.white[50],
      fontSize: { xs: "16px", md: "18px" },
      lineHeight: { xs: "24px", md: "28px" },
      fontWeight: 400,
      maxWidth: { md: "400px" },
   },
   ctaButton: {
      textTransform: "none",
   },
   imageContainer: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: { md: "0 0 auto" },
      order: { xs: 1, md: 2 },
      maxWidth: { xs: "100%", md: "50%" },
   },
})

export default function RegisterNowSectionFMCG() {
   const isMobile = useIsMobile()
   const router = useRouter()

   const handleExploreStreams = () => {
      router.push("/next-livestreams")
   }

   return (
      <Box sx={styles.fullWidthSection}>
         <Box id="CTA Container" sx={styles.ctaContainer}>
            <Box id="Text content" sx={styles.textContent}>
               <Typography variant="h3" sx={styles.heading}>
                  Don&apos;t miss your chance!
               </Typography>
               <Typography sx={styles.paragraph}>
                  Get one step closer to your dream job by exploring the live
                  streams available.
               </Typography>
               <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={styles.ctaButton}
                  onClick={handleExploreStreams}
               >
                  Explore live streams
               </Button>
            </Box>

            <Box sx={styles.imageContainer}>
               <Image
                  src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/consulting_page_explore_more_image.png?alt=media&token=453f0eb2-94ff-4029-b99e-835abe5b0a65"
                  alt="FMCG career illustration"
                  width={400}
                  height={280}
                  style={{
                     height: isMobile ? "200px" : "100%",
                     width: "auto",
                     maxWidth: "100%",
                     objectFit: "contain",
                  }}
                  priority
               />
            </Box>
         </Box>
      </Box>
   )
}
