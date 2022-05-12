import React, { useState } from "react"
import { wishListBorderRadius } from "../../../constants/pages"
import { alpha } from "@mui/material/styles"
import FilterIcon from "@mui/icons-material/FilterAltOutlined"
import SearchIcon from "@mui/icons-material/Search"
import { Button, InputBase } from "@mui/material"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import FilterMenu from "./FilterMenu"
import { useRouter } from "next/router"
import { useDebounce } from "react-use"
const styles = {
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
   },
}
const Search = () => {
   const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
   const { query, push } = useRouter()
   const [searchValue, setSearchValue] = useState<string>(
      (query.search as string) || ""
   )

   const filterActive = Boolean(query.upvote || query.interests || query.date)
   const handleOpenFilterMenu = (
      event: React.MouseEvent<HTMLButtonElement>
   ) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const open = Boolean(anchorEl)
   const id = open ? "wish-list-filter-popover" : undefined

   const [, cancelDebounce] = useDebounce(
      () => {
         console.log("-> Typing stopped and started query")
         handleQuery(searchValue)
      },
      2000,
      [searchValue]
   )

   const handleQuery = (searchQuery: string) => {
      const newQuery = {
         ...query,
      }
      if (!searchQuery) {
         delete newQuery.search
      } else {
         newQuery.search = searchQuery
      }
      void push(
         {
            pathname: "/wishlist",
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
            <Paper
               component={"form"}
               onSubmit={(e) => {
                  console.log("-> SUBMIT")
                  e.preventDefault()
                  cancelDebounce()
                  handleQuery(searchValue)
               }}
               variant="outlined"
               sx={styles.search}
            >
               <InputBase
                  sx={styles.inputRoot}
                  startAdornment={<SearchIcon />}
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
               />
            </Paper>
            <Button
               aria-describedby={id}
               startIcon={
                  <FilterIcon color={filterActive ? "inherit" : "primary"} />
               }
               sx={styles.filterButton}
               onClick={handleOpenFilterMenu}
               disableElevation
               variant={filterActive ? "contained" : "outlined"}
               color={filterActive ? "primary" : "grey"}
            >
               Filter
            </Button>
         </Stack>
         <FilterMenu
            id={id}
            open={open}
            anchorEl={anchorEl}
            handleClose={handleClose}
         />
      </>
   )
}

export default Search
