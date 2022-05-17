import React from "react"
import { Grid } from "@mui/material"
import CreateWishButton from "./CreateWishButton"
import Search from "./Search"

const CreateAndFilter = () => {
   return (
      <Grid container spacing={2}>
         <Grid item xs={12} md={6}>
            <CreateWishButton />
         </Grid>
         <Grid item xs={12} md={6}>
            <Search />
         </Grid>
      </Grid>
   )
}

export default CreateAndFilter
