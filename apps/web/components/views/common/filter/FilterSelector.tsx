import React, { useMemo, useState } from "react"
import { wishListBorderRadius } from "../../../../constants/pages"
import { alpha } from "@mui/material/styles"
import FilterIcon from "@mui/icons-material/FilterAltOutlined"
import SearchIcon from "@mui/icons-material/Search"
import { Box, Button, InputBase, Typography } from "@mui/material"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import FilterMenu from "./FilterMenu"
import { useRouter } from "next/router"
import { useDebounce } from "react-use"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { FilterEnum, useFilter } from "./Filter"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"

const styles = sxStyles({
   root: {
      height: "100%",
   },
   search: {
      position: "relative",
      borderRadius: wishListBorderRadius,
      backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
      "&:hover": {
         backgroundColor: (theme) => alpha(theme.palette.common.white, 0.25),
      },
      px: 2,
      py: 1.5,
      flex: 1,
   },
   inputRoot: {
      color: "inherit",
      "& .MuiInputBase-input": {
         paddingLeft: `1em`,
         transition: (theme) => theme.transitions.create("width"),
         width: "100%",
      },
   },
   filterButton: {
      borderRadius: wishListBorderRadius,
      height: "100%",
      maxWidth: "150px",
      fontSize: "15px",
   },
   roundNumber: {
      fontWeight: 500,
      borderRadius: "50%",
      ml: 1,
      px: 1.2,
      backgroundColor: (theme) => theme.palette.primary.main,
   },
})

const FilterSelector = () => {
   const { query, push, pathname } = useRouter()
   const [searchValue, setSearchValue] = useState<string>(
      (query.search as string) || ""
   )
   const isMobile = useIsMobile()
   const { numberOfActiveFilters, filtersToShow } = useFilter()
   const [isFilterDialogOpen, handleOpenFilterDialog, handleCloseFilterDialog] =
      useDialogStateHandler()

   const showSearch = useMemo(
      () => filtersToShow.includes(FilterEnum.search),
      [filtersToShow]
   )
   const filterActive = Boolean(numberOfActiveFilters > 0)
   const id = isFilterDialogOpen ? "wish-list-filter-popover" : undefined

   const [, cancelDebounce] = useDebounce(
      () => {
         handleQuery(searchValue)
      },
      2000,
      [searchValue]
   )

   const handleQuery = (searchQuery: string) => {
      if (
         (query.search === undefined && !searchValue) ||
         searchValue === query.search
      )
         return

      const newQuery = {
         ...query,
      }
      if (!searchQuery) {
         delete newQuery.search
      } else {
         newQuery.search = searchQuery
         newQuery.page = "0"
      }
      void push(
         {
            pathname: pathname,
            query: newQuery,
         },
         undefined,
         { shallow: true }
      )
   }

   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setSearchValue(value)
   }
   return (
      <>
         <Stack sx={styles.root} direction={"row"} spacing={2}>
            {showSearch ? (
               <Paper
                  component={"form"}
                  onSubmit={(e) => {
                     e.preventDefault()
                     cancelDebounce()
                     handleQuery(searchValue)
                  }}
                  variant="outlined"
                  sx={styles.search}
               >
                  <InputBase
                     sx={styles.inputRoot}
                     fullWidth
                     startAdornment={<SearchIcon />}
                     value={searchValue}
                     onChange={handleSearch}
                     placeholder="Search…"
                     inputProps={{ "aria-label": "search" }}
                  />
               </Paper>
            ) : null}
            {isMobile ? (
               <Button
                  aria-describedby={id}
                  sx={{ ...styles.filterButton, p: 1, minWidth: 0 }}
                  onClick={handleOpenFilterDialog}
                  disableElevation
                  color={filterActive ? "primary" : "grey"}
               >
                  <FilterIcon />
               </Button>
            ) : (
               <Button
                  aria-describedby={id}
                  endIcon={<FilterIcon />}
                  sx={styles.filterButton}
                  onClick={handleOpenFilterDialog}
                  disableElevation
                  color={"grey"}
               >
                  <Typography fontWeight={500} fontSize={"15px"}>
                     Filters
                  </Typography>
                  {numberOfActiveFilters > 0 ? (
                     <Box sx={styles.roundNumber}>{numberOfActiveFilters}</Box>
                  ) : null}
               </Button>
            )}
         </Stack>
         <FilterMenu
            open={isFilterDialogOpen}
            handleClose={handleCloseFilterDialog}
         />
      </>
   )
}

export default FilterSelector
