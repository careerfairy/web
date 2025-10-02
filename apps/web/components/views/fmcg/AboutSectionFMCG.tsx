import { Box, Typography, Container, Grid } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ShoppingCart, TrendingUp, Users, Target } from "react-feather"

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
      icon: <ShoppingCart />,
      title: "Consumer Insights",
      description: "Learn from professionals who understand consumer behavior, market trends, and brand positioning in the fast-moving consumer goods industry."
   },
   {
      icon: <TrendingUp />,
      title: "Brand Management",
      description: "Get guidance on brand strategy, product launches, and marketing campaigns from experts who've built successful consumer brands."
   },
   {
      icon: <Users />,
      title: "Retail Excellence",
      description: "Connect with retail and sales professionals who can share insights on distribution, merchandising, and customer engagement strategies."
   },
   {
      icon: <Target />,
      title: "Market Leadership",
      description: "Access mentorship from FMCG leaders who can guide you through supply chain optimization, innovation, and global market expansion."
   }
]

export function AboutSectionFMCG() {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="lg">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Why Choose CareerFairy for FMCG?
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  The FMCG industry moves fast, and so should your career. Our network of consumer goods professionals provides you with the insights, connections, and strategies you need to thrive in this dynamic sector.
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