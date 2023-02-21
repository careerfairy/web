import React from "react"
import { Box, Grid } from "@mui/material"
import PersonalInformation from "./PersonalInformation"
import Social from "./Social"

const AdminProfileOverview = ({}) => {
   return (
      <Box p={5}>
         <Grid container spacing={3}>
            <Grid item xs={12}>
               <PersonalInformation />
            </Grid>
            <Grid item xs={12}>
               <Social />
            </Grid>
         </Grid>
      </Box>
   )
}

export default AdminProfileOverview
