import { Box } from "@mui/material"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"

import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"
import { Search, XCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   searchField: {
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
            fontSize: "16px",
            fontWeight: "400",
         },
      },
      "& .MuiFilledInput-input": {
         color: (theme) => theme.palette.neutral[800],
         fontSize: "16px",
         fontWeight: "400",
      },
      "& svg": {
         // mr: "8px",
      },
   },
   searchIcon: {
      color: (theme) => theme.palette.neutral[600],
      width: "24px",
      height: "24px",
   },
   clearIcon: {
      width: "26px",
      height: "26px",
      color: (theme) => theme.brand.white[50],
      fill: (theme) => theme.brand.black[700],
      "&:hover": {
         fill: (theme) => theme.brand.black[800],
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
            endAdornment: (
               <Box
                  sx={styles.clearIcon}
                  component={XCircle}
                  onClick={() => setSearchTerm("")}
               />
            ),
         }}
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
      />
   )
}
