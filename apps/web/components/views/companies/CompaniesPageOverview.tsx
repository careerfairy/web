import { CircularProgress, Container, Grid } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import CompanySearch from "./CompanySearch"

const CompaniesPageOverview = () => {
   return (
      <Container maxWidth="xl">
         <SuspenseWithBoundary fallback={<CircularProgress />} hide={true}>
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <CompanySearch />
               </Grid>
            </Grid>
         </SuspenseWithBoundary>
      </Container>
   )
}

export default CompaniesPageOverview
