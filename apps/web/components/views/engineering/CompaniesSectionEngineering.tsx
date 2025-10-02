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

export function CompaniesSectionEngineering() {
   const [companies, setCompanies] = useState<Company[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const fetchCompanies = async () => {
         try {
            // This would be replaced with actual API call
            // For now, using mock data filtered by Engineering/Manufacturing industry
            const mockCompanies: Company[] = [
               { id: "1", name: "Tesla", industry: "Engineering", logo: "/companies/tesla.png" },
               { id: "2", name: "Boeing", industry: "Engineering", logo: "/companies/boeing.png" },
               { id: "3", name: "Siemens", industry: "Manufacturing", logo: "/companies/siemens.png" },
               { id: "4", name: "General Electric", industry: "Engineering", logo: "/companies/ge.png" },
               { id: "5", name: "Caterpillar", industry: "Manufacturing", logo: "/companies/caterpillar.png" },
               { id: "6", name: "Airbus", industry: "Engineering", logo: "/companies/airbus.png" }
            ]
            
            const filteredCompanies = mockCompanies.filter(company => 
               ["Engineering", "Manufacturing"].includes(company.industry)
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
                  Connect with Engineering Excellence
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Our network spans top engineering and manufacturing companies, connecting you with professionals who drive innovation in aerospace, automotive, technology, and industrial sectors.
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