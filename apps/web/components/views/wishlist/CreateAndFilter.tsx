import React, { useMemo } from "react"
import { Grid } from "@mui/material"
import CreateWishButton from "./CreateWishButton"
import Filter, { FilterEnum } from "../common/filter/Filter"
import { HandleAddNewWishToHits } from "../../../pages/wishlist"

interface Props {
   handleAddNewWishToHits: HandleAddNewWishToHits
}
const CreateAndFilter = ({ handleAddNewWishToHits }: Props) => {
   const filtersToShow = useMemo(
      () => [FilterEnum.search, FilterEnum.sortBy, FilterEnum.interests],
      []
   )

   return (
      <Grid container spacing={2}>
         <Grid item xs={12}>
            <CreateWishButton handleAddNewWishToHits={handleAddNewWishToHits} />
         </Grid>
         <Grid item xs={12}>
            <Filter filtersToShow={filtersToShow} />
         </Grid>
      </Grid>
   )
}

export default CreateAndFilter
