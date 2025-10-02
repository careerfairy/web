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

export function HeroSectionEngineering() {
   return (
      <Box sx={styles.heroContainer}>
         <Container maxWidth="lg">
            <Box sx={styles.contentContainer}>
               <Typography variant="brandedH1" sx={styles.title}>
                  Engineer Your Path to Success with Industry Experts
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Connect with seasoned engineering professionals and discover opportunities in manufacturing, automotive, aerospace, and technology. Get mentorship from leaders at Tesla, Boeing, Siemens, and top engineering firms.
               </Typography>
               <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  sx={styles.ctaButton}
               >
                  Explore Engineering Careers
               </Button>
               
               <Box sx={styles.statsContainer}>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        800+
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Engineering Experts
                     </Typography>
                  </Box>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        100+
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Tech & Manufacturing Companies
                     </Typography>
                  </Box>
                  <Box sx={styles.statItem}>
                     <Typography variant="brandedH3" sx={styles.statNumber}>
                        92%
                     </Typography>
                     <Typography variant="medium" sx={styles.statLabel}>
                        Career Advancement Rate
                     </Typography>
                  </Box>
               </Box>
            </Box>
         </Container>
      </Box>
   )
}