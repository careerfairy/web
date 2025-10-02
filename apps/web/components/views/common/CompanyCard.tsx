import { Box, Card, CardContent, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Company } from "types/Company"

const styles = sxStyles({
   card: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: 3,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "grey.200",
      backgroundColor: "background.paper",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
         borderColor: "primary.main",
         transform: "translateY(-2px)",
         boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }
   },
   logoContainer: {
      width: 80,
      height: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mb: 2,
      borderRadius: 1,
      backgroundColor: "grey.50"
   },
   logo: {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain"
   },
   companyName: {
      textAlign: "center",
      fontWeight: 600,
      color: "text.primary",
      fontSize: "0.9rem"
   }
})

interface CompanyCardProps {
   company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
   return (
      <Card sx={styles.card} elevation={0}>
         <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Box sx={styles.logoContainer}>
               {company.logo ? (
                  <img 
                     src={company.logo} 
                     alt={`${company.name} logo`}
                     style={styles.logo}
                  />
               ) : (
                  <Typography variant="brandedH5" color="text.secondary">
                     {company.name.charAt(0)}
                  </Typography>
               )}
            </Box>
            <Typography variant="medium" sx={styles.companyName}>
               {company.name}
            </Typography>
         </CardContent>
      </Card>
   )
}