import { FC } from "react"
import { Container, Grid } from "@mui/material"
import Companies from "./Companies"
import { Group } from "@careerfairy/shared-lib/groups"

type Props = {
   serverSideCompanies: Group[]
}

const CompaniesPageOverview: FC<Props> = ({ serverSideCompanies }) => {
   return (
      <Container maxWidth="xl">
         <Grid container spacing={2}>
            <Grid item xs={12}>
               Search bar
            </Grid>
            <Grid item xs={12}>
               <Companies initialData={serverSideCompanies} />
            </Grid>
         </Grid>
      </Container>
   )
}

export default CompaniesPageOverview
