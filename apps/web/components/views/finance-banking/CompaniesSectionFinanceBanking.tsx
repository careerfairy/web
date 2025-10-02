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

export function CompaniesSectionFinanceBanking() {
   const [companies, setCompanies] = useState<Company[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const fetchCompanies = async () => {
         try {
            // This would be replaced with actual API call
            // For now, using mock data filtered by Finance&Banking industry
            const mockCompanies: Company[] = [
               { id: "1", name: "Goldman Sachs", industry: "Finance&Banking", logo: "/companies/goldman-sachs.png" },
               { id: "2", name: "JPMorgan Chase", industry: "Finance&Banking", logo: "/companies/jpmorgan.png" },
               { id: "3", name: "Morgan Stanley", industry: "Finance&Banking", logo: "/companies/morgan-stanley.png" },
               { id: "4", name: "Bank of America", industry: "Finance&Banking", logo: "/companies/boa.png" },
               { id: "5", name: "Citigroup", industry: "Finance&Banking", logo: "/companies/citi.png" },
               { id: "6", name: "Deutsche Bank", industry: "Finance&Banking", logo: "/companies/deutsche-bank.png" }
            ]
            
            const filteredCompanies = mockCompanies.filter(company => 
               company.industry === "Finance&Banking"
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
                  Connect with Financial Powerhouses
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Our network includes professionals from leading investment banks, commercial banks, fintech companies, and financial services firms worldwide.
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