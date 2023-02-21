import React from "react"
import { Box, Grid, Typography } from "@mui/material"
import AvatarEdit from "./AvatarEdit"
import Stack from "@mui/material/Stack"

const PersonalInformation = () => {
   return (
      <Stack spacing={3}>
         <Typography fontWeight={700} variant="h5">
            Personal Information
         </Typography>
         <Box>
            <Grid container spacing={2}>
               <Grid item xs={12} sm="auto">
                  <AvatarEdit />
               </Grid>
               <Grid item xs={12} sm>
                  Details
               </Grid>
            </Grid>
         </Box>
      </Stack>
   )
}

export default PersonalInformation
