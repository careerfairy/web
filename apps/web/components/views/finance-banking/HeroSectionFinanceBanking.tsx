import { Box, Typography, Button, Container } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ArrowRight } from "react-feather"

const styles = sxStyles({
   heroContainer: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      py: { xs: 8, md: 12 }
   },
   contentContainer: {
      textAlign: { xs: "center", md: "left" },
      maxWidth: "800px"
   },
   title: {
      mb: 3,
      fontWeight: 700,
      color: "text.primary",
      lineHeight: 1.2
   },
   subtitle: {
      mb: 4,
      color: "text.secondary",
      maxWidth: "600px",
      mx: { xs: "auto", md: 0 }
   },
   ctaButton: {
      borderRadius: "100px",
      px: 4,
      py: 1.5,
      textTransform: "none",
      fontSize: "1.1rem",
      fontWeight: 600,
      "& .MuiButton-endIcon": {
         ml: 1
      }
   },
   statsContainer: {
      mt: 6,
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      gap: { xs: 2, sm: 4 },
      justifyContent: { xs: "center", md: "flex-start" }
   },
   statItem: {
      textAlign: "center"
   },
   statNumber: {
      fontWeight: 700,
      color: "primary.main",
      mb: 0.5
   },
   statLabel: {
      color: "text.secondary",
      fontSize: "0.9rem"
   }
})

export function HeroSectionFinanceBanking() {
   return (
      <Box sx={styles.heroContainer}>
         <Container maxWidth="lg">
            <Box sx={styles.contentContainer}>
               <Typography variant="brandedH1" sx={styles.title}>
                  Accelerate Your Finance & Banking Career
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Connect with finance leaders and banking professionals to unlock opportunities in investment banking, corporate finance, fintech, and wealth management. Get guidance from experts at Goldman Sachs, JPMorgan, and leading financial institutions.
               </Typography>
               <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  sx={styles.ctaButton}
               >
                  Explore Finance Careers
               </Button>
               
               <Box sx={styles.statsContainer}>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        1,200+
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Finance Professionals
                     </Typography>
                  </Box>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        75+
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Financial Institutions
                     </Typography>
                  </Box>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        97%
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Placement Success
                     </Typography>
                  </Box>
               </Box>
            </Box>
         </Container>
      </Box>
   )
}