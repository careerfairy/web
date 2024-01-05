import React from "react"
import QueryForm from "./QueryForm"
import { Box, Grid } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"

const styles = sxStyles({
   root: {
      p: 2,
   },
})
const QueryUsersOverview = () => {
   return (
      <Box sx={styles.root}>
         <Grid container spacing={2}>
            <Grid item xs>
               <SuspenseWithBoundary>
                  <QueryForm />
               </SuspenseWithBoundary>
            </Grid>
         </Grid>
      </Box>
   )
}

export default QueryUsersOverview
