import SearchIcon from "@mui/icons-material/Search"
import { Avatar, Button, InputBase, Typography } from "@mui/material"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import { useRouter } from "next/router"
import React, { useMemo, useState } from "react"
import { Filter } from "react-feather"
import { useDebounce } from "react-use"
import { wishListBorderRadius } from "../../../../constants/pages"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { FilterEnum, useFilter } from "./Filter"
import FilterMenu from "./FilterMenu"

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
      textTransform: "none",
      "& svg": {
         width: 20,
         height: 20,
      },
      color: "#3D3D47",
   },
   filterBadge: {
      width: 25,
      height: 25,
      fontSize: '14px',
      fontWeight: 500,
      ml: 1,
      bgcolor: 'primary.main',
      color: 'text.primary',
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
      () => filtersToShow.includes(FilterEnum.SEARCH),
      [filtersToShow]
   )
   const filterActive = Boolean(numberOfActiveFilters > 0)
   const id = isFilterDialogOpen ? "live-stream-filter-popover" : undefined

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
                  sx={{ ...styles.filterButton, p: 1 }}
                  onClick={handleOpenFilterDialog}
                  disableElevation
                  color={filterActive ? "primary" : "grey"}
               >
                  <Filter />
               </Button>
            ) : (
               <Button
                  aria-describedby={id}
                  endIcon={<Filter />}
                  sx={styles.filterButton}
                  onClick={handleOpenFilterDialog}
                  disableElevation
               >
                  <Typography
                     fontWeight={500}
                     fontSize={"15px"}
                     sx={{ pr: numberOfActiveFilters > 0 ? 0 : 4 }}
                  >
                     Filters
                  </Typography>
                  {numberOfActiveFilters > 0 && (
                     <Avatar sx={styles.filterBadge}>{numberOfActiveFilters}</Avatar>
                  )}
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
