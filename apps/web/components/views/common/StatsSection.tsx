import { Box, Typography, Container, Grid } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   section: {
      py: { xs: 8, md: 12 },
      backgroundColor: "primary.50"
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
      maxWidth: "600px",
      mx: "auto"
   },
   statItem: {
      textAlign: "center",
      p: 3
   },
   statNumber: {
      fontWeight: 700,
      color: "primary.main",
      mb: 1
   },
   statLabel: {
      color: "text.secondary",
      fontWeight: 500
   },
   statDescription: {
      color: "text.secondary",
      mt: 1,
      fontSize: "0.9rem"
   }
})

interface StatItem {
   number: string
   label: string
   description?: string
}

interface StatsSectionProps {
   title?: string
   subtitle?: string
   stats?: StatItem[]
}

const defaultStats: StatItem[] = [
   {
      number: "10,000+",
      label: "Career Conversations",
      description: "Meaningful connections made"
   },
   {
      number: "500+",
      label: "Industry Professionals",
      description: "From leading companies"
   },
   {
      number: "95%",
      label: "Success Rate",
      description: "Career advancement achieved"
   },
   {
      number: "50+",
      label: "Countries",
      description: "Global network reach"
   }
]

export function StatsSection({ 
   title = "Trusted by Professionals Worldwide",
   subtitle = "Join thousands of professionals who have accelerated their careers through CareerFairy's expert guidance and industry connections.",
   stats = defaultStats
}: StatsSectionProps) {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="lg">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  {title}
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  {subtitle}
               </Typography>
            </Box>
            
            <Grid container spacing={4}>
               {stats.map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                     <Box sx={styles.statItem}>
                        <Typography variant="brandedH2" sx={styles.statNumber}>
                           {stat.number}
                        </Typography>
                        <Typography variant="medium" sx={styles.statLabel}>
                           {stat.label}
                        </Typography>
                        {stat.description && (
                           <Typography variant="small" sx={styles.statDescription}>
                              {stat.description}
                           </Typography>
                        )}
                     </Box>
                  </Grid>
               ))}
            </Grid>
         </Container>
      </Box>
   )
}