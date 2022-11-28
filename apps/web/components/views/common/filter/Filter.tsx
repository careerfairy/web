import React, { useMemo, useState } from "react"
import { wishListBorderRadius } from "../../../../constants/pages"
import { alpha } from "@mui/material/styles"
import FilterIcon from "@mui/icons-material/FilterAltOutlined"
import SearchIcon from "@mui/icons-material/Search"
import { Button, InputBase } from "@mui/material"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import FilterMenu from "./FilterMenu"
import { useRouter } from "next/router"
import { useDebounce } from "react-use"
import useIsMobile from "../../../custom-hook/useIsMobile"
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
      height: "100%",
      maxWidth: "116px",
   },
}

export enum FilterEnum {
   sortBy = "sortBy",
   languages = "languages",
   interests = "interests",
   jobCheck = "jobCheck",
   search = "search",
}

type Props = {
   filtersToShow: FilterEnum[]
}

const Filter = ({ filtersToShow }: Props) => {
   const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
   const { query, push, pathname } = useRouter()
   const [searchValue, setSearchValue] = useState<string>(
      (query.search as string) || ""
   )
   const isMobile = useIsMobile()

   const showSearch = useMemo(
      () => filtersToShow.includes(FilterEnum.search),
      [filtersToShow]
   )
   const filterActive = Boolean(
      query.upvote ||
         query.interests ||
         query.date ||
         query.jobCheck ||
         query.languages
   )
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
                  onClick={handleOpenFilterMenu}
                  disableElevation
                  variant={filterActive ? "contained" : "outlined"}
                  color={filterActive ? "primary" : "grey"}
               >
                  <FilterIcon color={filterActive ? "inherit" : "primary"} />
               </Button>
            ) : (
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
            )}
         </Stack>
         <FilterMenu
            id={id}
            open={open}
            anchorEl={anchorEl}
            handleClose={handleClose}
            filtersToShow={filtersToShow}
         />
      </>
   )
}

export default Filter
