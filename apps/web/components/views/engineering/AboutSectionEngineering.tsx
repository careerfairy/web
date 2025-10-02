import { Box, Typography, Container, Grid } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Settings, Zap, Shield, Layers } from "react-feather"

const styles = sxStyles({
   section: {
      py: { xs: 8, md: 12 },
      backgroundColor: "background.paper"
   },
   titleContainer: {
      textAlign: "center",
      mb: { xs: 6, md: 8 }
   },
   title: {
      mb: 3,
      fontWeight: 700,
      color: "text.primary"
   },
   subtitle: {
      color: "text.secondary",
      maxWidth: "800px",
      mx: "auto"
   },
   featureCard: {
      textAlign: "center",
      p: 4,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
   },
   iconContainer: {
      width: 80,
      height: 80,
      borderRadius: "50%",
      backgroundColor: "primary.50",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mb: 3,
      "& svg": {
         width: 32,
         height: 32,
         color: "primary.main"
      }
   },
   featureTitle: {
      mb: 2,
      fontWeight: 600,
      color: "text.primary"
   },
   featureDescription: {
      color: "text.secondary",
      lineHeight: 1.6
   }
})

const features = [
   {
      icon: <Settings />,
      title: "Technical Excellence",
      description: "Connect with engineering professionals who excel in design, development, and manufacturing across aerospace, automotive, and industrial sectors."
   },
   {
      icon: <Zap />,
      title: "Innovation Leadership",
      description: "Learn from engineers who drive innovation in emerging technologies, sustainable solutions, and cutting-edge manufacturing processes."
   },
   {
      icon: <Shield />,
      title: "Quality & Safety",
      description: "Get guidance from experts in quality assurance, safety protocols, and regulatory compliance across various engineering disciplines."
   },
   {
      icon: <Layers />,
      title: "Systems Thinking",
      description: "Access mentorship from senior engineers who understand complex systems integration, project management, and cross-functional collaboration."
   }
]

export function AboutSectionEngineering() {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="lg">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Why Choose CareerFairy for Engineering?
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Engineering careers require precision, innovation, and continuous learning. Our network of experienced engineers provides you with technical insights, career guidance, and industry connections to accelerate your professional growth.
               </Typography>
            </Box>
            
            <Grid container spacing={4}>
               {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                     <Box sx={styles.featureCard}>
                        <Box sx={styles.iconContainer}>
                           {feature.icon}
                        </Box>
                        <Typography variant="brandedH5" sx={styles.featureTitle}>
                           {feature.title}
                        </Typography>
                        <Typography variant="medium" sx={styles.featureDescription}>
                           {feature.description}
                        </Typography>
                     </Box>
                  </Grid>
               ))}
            </Grid>
         </Container>
      </Box>
   )
}