import { Box, Button, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   section: {
      width: "100%",
      padding: 3,
   },
   container: (theme) => ({
      backgroundColor: theme => theme.brand.white[100],
      borderRadius: "16px",
      padding: 4,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
   }),
   heading: (theme) => ({
      color: "text.primary",
      fontWeight: 700,
      marginBottom: 1,
   }),
   description: (theme) => ({
      color: "text.secondary",
      marginBottom: 2,
      maxWidth: "600px",
   }),
   exploreButton: {
      backgroundColor: "primary.main",
      color: "common.white",
      padding: "12px 24px",
      textTransform: "none",
      "&:hover": {
         backgroundColor: "primary.dark",
      },
   },
})

export default function ReasonToJoinSectionConsulting() {
   const router = useRouter()

   const handleExploreClick = () => {
      // Navigate to the next-livestreams page within the same site
      router.push("/next-livestreams")
   }

   return (
      <Box sx={styles.section}>
         <Box sx={styles.container}>
            <Typography variant="brandedH3" sx={styles.heading}>
               Ready to take the next step in your consulting career?
            </Typography>
            <Typography variant="brandedBody" sx={styles.description}>
               Discover exclusive live streams from top consulting firms and get insights 
               from industry professionals to accelerate your career journey.
            </Typography>
            <Button 
               variant="contained" 
               size="medium"
               sx={styles.exploreButton}
               onClick={handleExploreClick}
            >
               Explore live streams
            </Button>
         </Box>
      </Box>
   )
}