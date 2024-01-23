import { FC, useState } from "react"
import { CircularProgress, Container, Grid } from "@mui/material"
import Companies from "./Companies"
import { Group } from "@careerfairy/shared-lib/groups"
import CompanySearch from "./CompanySearch"
import { useRouter } from "next/router"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
// TODO-WG- Replace with useMountedState
// const Companies = dynamic(
//    () => import("./Companies"),
//    { ssr: false }
// )
type Props = {
   serverSideCompanies: Group[]
}

const CompaniesPageOverview: FC<Props> = ({ serverSideCompanies }) => {
   const { query } = useRouter()
   const [resultCount, setResultCount] = useState<number>(null)
   // TODO-WG Destructure query parameters onto custom type
   return (
      <Container maxWidth="xl">
         <SuspenseWithBoundary fallback={<CircularProgress />} hide={true}>
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <CompanySearch filterResults={resultCount} />
               </Grid>
               <Grid item xs={12}>
                  <Companies
                     initialData={serverSideCompanies}
                     key={JSON.stringify(query)}
                     setResults={setResultCount}
                  />
               </Grid>
            </Grid>
         </SuspenseWithBoundary>
      </Container>
   )
}

export default CompaniesPageOverview
