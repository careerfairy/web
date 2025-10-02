import { Box, Typography, Container, Grid } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useEffect, useState } from "react"
import { Company } from "types/Company"
import { CompanyCard } from "../common/CompanyCard"

const styles = sxStyles({
   section: {
      py: { xs: 8, md: 12 },
      backgroundColor: "grey.50"
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
      maxWidth: "700px",
      mx: "auto"
   },
   companiesGrid: {
      mt: 4
   }
})

export function CompaniesSectionFMCG() {
   const [companies, setCompanies] = useState<Company[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const fetchCompanies = async () => {
         try {
            // This would be replaced with actual API call
            // For now, using mock data filtered by FMCG industry
            const mockCompanies: Company[] = [
               { id: "1", name: "Unilever", industry: "FMCG", logo: "/companies/unilever.png" },
               { id: "2", name: "Procter & Gamble", industry: "FMCG", logo: "/companies/pg.png" },
               { id: "3", name: "Nestlé", industry: "FMCG", logo: "/companies/nestle.png" },
               { id: "4", name: "Coca-Cola", industry: "FMCG", logo: "/companies/cocacola.png" },
               { id: "5", name: "PepsiCo", industry: "FMCG", logo: "/companies/pepsico.png" },
               { id: "6", name: "L'Oréal", industry: "FMCG", logo: "/companies/loreal.png" }
            ]
            
            const filteredCompanies = mockCompanies.filter(company => 
               company.industry === "FMCG"
            )
            
            setCompanies(filteredCompanies)
         } catch (error) {
            console.error("Error fetching companies:", error)
         } finally {
            setLoading(false)
         }
      }

      fetchCompanies()
   }, [])

   return (
      <Box sx={styles.section}>
         <Container maxWidth="lg">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Connect with FMCG Industry Leaders
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Our network includes professionals from the world's leading consumer goods companies, offering you insights into brand management, retail strategy, and market innovation.
               </Typography>
            </Box>
            
            <Grid container spacing={3} sx={styles.companiesGrid}>
               {companies.map((company) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={company.id}>
                     <CompanyCard company={company} />
                  </Grid>
               ))}
            </Grid>
         </Container>
      </Box>
   )
}