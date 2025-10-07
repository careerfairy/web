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

export interface RegisterNowSectionConfig {
   heading: string
   description: string
   buttonText: string
   imageUrl: string
   imageAlt: string
}

interface RegisterNowSectionProps {
   config: RegisterNowSectionConfig
}

export default function RegisterNowSection({
   config,
}: RegisterNowSectionProps) {
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
                  {config.heading}
               </Typography>
               <Typography sx={styles.paragraph}>
                  {config.description}
               </Typography>
               <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={styles.ctaButton}
                  onClick={handleExploreStreams}
               >
                  {config.buttonText}
               </Button>
            </Box>

            <Box sx={styles.imageContainer}>
               <Image
                  src={config.imageUrl}
                  alt={config.imageAlt}
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
