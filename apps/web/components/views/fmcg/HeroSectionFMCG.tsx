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

export function HeroSectionFMCG() {
   return (
      <Box sx={styles.heroContainer}>
         <Container maxWidth="lg">
            <Box sx={styles.contentContainer}>
               <Typography variant="brandedH1" sx={styles.title}>
                  Fast-Track Your FMCG Career with Expert Guidance
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Connect with top FMCG professionals and unlock opportunities in consumer goods, retail, and brand management. Get personalized career advice from industry leaders at Unilever, P&G, Nestlé, and more.
               </Typography>
               <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  sx={styles.ctaButton}
               >
                  Explore FMCG Careers
               </Button>
               
               <Box sx={styles.statsContainer}>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        500+
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        FMCG Professionals
                     </Typography>
                  </Box>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        50+
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Consumer Brands
                     </Typography>
                  </Box>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        95%
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Success Rate
                     </Typography>
                  </Box>
               </Box>
            </Box>
         </Container>
      </Box>
   )
}