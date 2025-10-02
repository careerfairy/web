import { Box, Typography, Button, Container } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ArrowRight } from "react-feather"

const styles = sxStyles({
   section: {
      py: { xs: 8, md: 12 },
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white"
   },
   contentContainer: {
      textAlign: "center",
      maxWidth: "600px",
      mx: "auto"
   },
   title: {
      mb: 3,
      fontWeight: 700,
      color: "white"
   },
   subtitle: {
      mb: 4,
      color: "rgba(255, 255, 255, 0.9)",
      lineHeight: 1.6
   },
   ctaButton: {
      backgroundColor: "white",
      color: "primary.main",
      borderRadius: "100px",
      px: 4,
      py: 1.5,
      textTransform: "none",
      fontSize: "1.1rem",
      fontWeight: 600,
      "&:hover": {
         backgroundColor: "rgba(255, 255, 255, 0.9)",
         transform: "translateY(-2px)"
      },
      "& .MuiButton-endIcon": {
         ml: 1
      }
   }
})

export function CTASectionEngineering() {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="lg">
            <Box sx={styles.contentContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Ready to Engineer Your Success?
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Join thousands of engineers who have advanced their careers through CareerFairy. Connect with industry experts, gain technical insights, and unlock opportunities at leading engineering and manufacturing companies.
               </Typography>
               <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  sx={styles.ctaButton}
               >
                  Start Your Engineering Journey
               </Button>
            </Box>
         </Container>
      </Box>
   )
}