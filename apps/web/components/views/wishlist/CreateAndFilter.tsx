import React from "react"
import { Grid } from "@mui/material"
import CreateWishButton from "./CreateWishButton"
import Search from "./Search"
import { HandleAddNewWishToHits } from "../../../pages/wishlist"

interface Props {
   handleAddNewWishToHits: HandleAddNewWishToHits
}
const CreateAndFilter = ({ handleAddNewWishToHits }: Props) => {
   return (
      <Grid container spacing={2}>
         <Grid item xs={12}>
            <CreateWishButton handleAddNewWishToHits={handleAddNewWishToHits} />
         </Grid>
         <Grid item xs={12}>
            <Search />
         </Grid>
      </Grid>
   )
}

export default CreateAndFilter
