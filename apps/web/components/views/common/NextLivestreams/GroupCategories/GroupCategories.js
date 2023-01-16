import React from "react"
import { Box, Button, Collapse, Divider, Grid } from "@mui/material"
import CategoryCard from "./CategoryCard"
import FilterIcon from "@mui/icons-material/Tune"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "../../../../../store/actions"

const styles = {
   actions: {
      display: "flex",
      flexFlow: "column",
      "& > * + *": {
         marginTop: (theme) => theme.spacing(3),
      },
   },
}

const GroupCategories = ({ groupData, handleToggleActive, hasCategories }) => {
   const dispatch = useDispatch()
   const filterOpen = useSelector((state) => state.nextLivestreams.filterOpen)

   const handleToggleFilter = () =>
      dispatch(actions.toggleNextLivestreamsFilter())

   return hasCategories ? (
      <Grid item xs={12}>
         <Button
            size="large"
            color={filterOpen ? "primary" : "grey"}
            onClick={handleToggleFilter}
            startIcon={<FilterIcon />}
         >
            Filters
         </Button>
         <Collapse in={filterOpen}>
            <Box sx={styles.actions}>
               {groupData.categories.map((category) => (
                  <CategoryCard
                     key={category.id}
                     category={category}
                     handleToggleActive={handleToggleActive}
                  />
               ))}
            </Box>
         </Collapse>
         <Divider />
      </Grid>
   ) : null
}

export default GroupCategories
