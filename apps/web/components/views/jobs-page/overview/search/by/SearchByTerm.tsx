import { Box } from "@mui/material"
import { XCircleIcon } from "components/views/common/icons/XCircleIcon"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"

import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"
import { Search } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   searchField: {
      "& .MuiFilledInput-root": {
         border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
         background: (theme) => theme.brand.white[100],
         "&.Mui-focused": {
            border: (theme) => `1.2px solid ${theme.palette.neutral[100]}`,
         },
      },
      "& .MuiInputBase-root": {
         p: "4px 12px",
         height: "48px",
         borderRadius: "12px",
         border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
         background: (theme) => theme.brand.white[100],
      },
      "& .MuiInputBase-input": {
         ml: "8px",
         p: "0px",
         "&::placeholder": {
            color: (theme) => theme.palette.neutral[600],
            fontSize: {
               xs: "14px",
               sm: "14px",
               md: "16px",
            },
            fontWeight: "400",
         },
      },
      "& .MuiFilledInput-input": {
         color: (theme) => theme.palette.neutral[800],
         fontSize: {
            xs: "14px",
            sm: "14px",
            md: "16px",
         },
         fontWeight: "400",
      },
   },
   input: {
      border: (theme) => {
         return {
            xs: `1px solid ${theme.palette.neutral[100]}`,
            sm: `1px solid ${theme.palette.neutral[100]}`,
            md: `1px solid ${theme.palette.neutral[50]}`,
         }
      },
   },
   searchIcon: {
      color: (theme) => theme.palette.neutral[600],
      width: "24px",
      height: "24px",
   },
   clearIcon: {
      width: "24px",
      height: "24px",
      "&:hover": {
         cursor: "pointer",
      },
   },
})

export const SearchByTerm = () => {
   const { searchTerm, setSearchTerm } = useJobsOverviewContext()

   return (
      <BrandedTextField
         fullWidth
         placeholder="Search jobs or companies"
         sx={styles.searchField}
         InputProps={{
            startAdornment: <Box component={Search} sx={styles.searchIcon} />,
            endAdornment: searchTerm?.length ? (
               <Box
                  sx={styles.clearIcon}
                  component={XCircleIcon}
                  onClick={() => setSearchTerm("")}
               />
            ) : null,
            sx: styles.input,
         }}
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
      />
   )
}
