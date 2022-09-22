import Box from "@mui/material/Box"
import RegistrationSourcesProvider from "./RegistrationSourcesContext"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import CircularLoader from "../../../../loader/CircularLoader"
import LivestreamsTable from "./LivestreamsTable"
import { Grid } from "@mui/material"
import AggregatedSourcesChart from "./AggregatedSourcesChart"

type Props = {
   group: Group
   loading: boolean
   streamsFromTimeFrameAndFuture: LivestreamEvent[]
}

const Sources = (props: Props) => {
   if (props.loading && props.streamsFromTimeFrameAndFuture.length === 0) {
      // still loading the parent livestreams
      return <CircularLoader sx={{ m: 3 }} />
   }

   return (
      <SuspenseWithBoundary fallback={<CircularLoader sx={{ m: 3 }} />}>
         <RegistrationSourcesProvider
            group={props.group}
            streamsFromTimeFrameAndFuture={props.streamsFromTimeFrameAndFuture}
         >
            <>
               <Box p={3}>
                  <Grid container spacing={3}>
                     <Grid item xs={12}>
                        <AggregatedSourcesChart />
                     </Grid>
                  </Grid>
               </Box>

               <Box p={3} pt={0}>
                  <LivestreamsTable />
               </Box>
            </>
         </RegistrationSourcesProvider>
      </SuspenseWithBoundary>
   )
}

export default Sources
