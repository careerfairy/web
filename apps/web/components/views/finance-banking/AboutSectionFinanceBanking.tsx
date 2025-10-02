import { Box, Typography, Container, Grid } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { DollarSign, TrendingUp, PieChart, Briefcase } from "react-feather"

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
      icon: <DollarSign />,
      title: "Investment Banking",
      description: "Connect with investment bankers who can guide you through M&A, capital markets, and corporate finance opportunities at top-tier institutions."
   },
   {
      icon: <TrendingUp />,
      title: "Financial Markets",
      description: "Learn from traders, analysts, and portfolio managers who navigate equity, fixed income, and derivatives markets with expertise."
   },
   {
      icon: <PieChart />,
      title: "Risk & Analytics",
      description: "Get insights from risk management professionals and quantitative analysts who shape financial strategy and regulatory compliance."
   },
   {
      icon: <Briefcase />,
      title: "Corporate Finance",
      description: "Access mentorship from CFOs and finance leaders who excel in financial planning, treasury management, and strategic decision-making."
   }
]

export function AboutSectionFinanceBanking() {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="lg">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Why Choose CareerFairy for Finance & Banking?
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  The finance industry demands precision, analytical thinking, and strategic insight. Our network of finance professionals provides you with market knowledge, career strategies, and connections to excel in banking, investment, and corporate finance.
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