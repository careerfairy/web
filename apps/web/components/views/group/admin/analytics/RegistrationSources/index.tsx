import Box from "@mui/material/Box"
import RegistrationSourcesProvider from "./RegistrationSourcesContext"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import CircularLoader from "../../../../loader/CircularLoader"
import LivestreamsTable from "./LivestreamsTable"
import { Grid, Typography } from "@mui/material"
import AggregatedSourcesChart from "./AggregatedSourcesChart"

type Props = {
   group: Group
   loading: boolean
   streamsFromTimeFrameAndFuture: LivestreamEvent[]
}

const Sources = (props: Props) => {
   if (props.loading && props.streamsFromTimeFrameAndFuture.length === 0) {
      // still loading the parent livestreams
      return <Loader />
   }

   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <RegistrationSourcesProvider
            group={props.group}
            streamsFromTimeFrameAndFuture={props.streamsFromTimeFrameAndFuture}
         >
            <Box p={3} pr={0}>
               <Grid container spacing={3}>
                  <Grid item xs={12}>
                     <AggregatedSourcesChart />
                  </Grid>
                  <Grid item xs={12}>
                     <LivestreamsTable />
                  </Grid>
               </Grid>
            </Box>
         </RegistrationSourcesProvider>
      </SuspenseWithBoundary>
   )
}

const Loader = () => {
   return (
      <Box sx={{ width: "100%" }}>
         <CircularLoader sx={{ m: 3 }} />
         <Typography textAlign="center">
            Crunching the data and creating the visualizations for you..
         </Typography>
      </Box>
   )
}

export default Sources
