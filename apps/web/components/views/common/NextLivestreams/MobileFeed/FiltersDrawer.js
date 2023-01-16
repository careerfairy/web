import React, { useEffect } from "react"
import { Box, Drawer, Typography } from "@mui/material"
import CategoryCard from "../GroupCategories/CategoryCard"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "../../../../../store/actions"
import IconButton from "@mui/material/IconButton"
import CloseDrawerIcon from "@mui/icons-material/ExpandMore"

const styles = {
   actions: {
      display: "flex",
      flexFlow: "column",
      "& > * + *": {
         marginTop: (theme) => theme.spacing(1),
      },
   },
   paperRoot: {
      borderRadius: (theme) => theme.spacing(2, 2, 0, 0),
   },
}

const FiltersDrawer = ({ groupData, handleToggleActive, hasCategories }) => {
   const filterOpen = useSelector(
      (state) => state.nextLivestreams.filterOpen && hasCategories
   )
   const dispatch = useDispatch()
   useEffect(() => {
      if (!hasCategories) {
         handleCloseFilter()
      }
   }, [hasCategories])

   const handleCloseFilter = () =>
      dispatch(actions.closeNextLivestreamsFilter())

   return (
      <Drawer
         onClose={handleCloseFilter}
         anchor="bottom"
         open={filterOpen}
         PaperProps={{
            sx: styles.paperRoot,
         }}
      >
         <Box p={2} sx={styles.actions}>
            <Box
               display="flex"
               alignItems="center"
               justifyContent="space-between"
            >
               <Typography color="textSecondary" variant="h5">
                  Filters
               </Typography>
               <IconButton onClick={handleCloseFilter} size="large">
                  <CloseDrawerIcon />
               </IconButton>
            </Box>
            {groupData.categories?.map((category) => (
               <CategoryCard
                  key={category.id}
                  category={category}
                  handleToggleActive={handleToggleActive}
               />
            ))}
         </Box>
      </Drawer>
   )
}

export default FiltersDrawer
