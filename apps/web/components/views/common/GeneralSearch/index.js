import React, { useState } from "react"
import { alpha } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import { InputAdornment, TextField } from "@mui/material"

const styles = {
   search: (theme) => ({
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      "&:hover": {
         backgroundColor: alpha(theme.palette.common.white, 0.25),
      },

      marginRight: theme.spacing(1),

      [theme.breakpoints.down("md")]: {
         marginLeft: "auto",
      },
   }),
   searchIcon: {
      fontSize: (theme) => theme.typography.h1.fontSize,
   },
   inputRoot: {
      color: "inherit",
      fontSize: (theme) => theme.typography.h1.fontSize,
   },
   inputInput: {
      transition: (theme) => theme.transitions.create("width"),
      width: "100%",
      padding: (theme) => theme.spacing(1, 1, 1, 1),
   },
}

const GeneralSearch = () => {
   const [searchParams, setSearchParams] = useState("")
   const handleChange = (event) => {
      setSearchParams(event.target.value)
   }

   const handleSubmitSearch = () => {}

   return (
      <TextField
         placeholder="Search…"
         fullWidth
         sx={styles.root}
         onChange={handleChange}
         value={searchParams}
         InputProps={{
            endAdornment: (
               <InputAdornment position="start">
                  <SearchIcon color="inherit" sx={styles.searchIcon} />
               </InputAdornment>
            ),
            "aria-label": "search",
            inputProps: {},
            // classes: {
            // root: classes.inputRoot,
            // input: classes.inputInput,
            // },
            sx: styles.search,
         }}
      />
   )
}

export default GeneralSearch
