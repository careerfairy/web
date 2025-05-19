import { Box, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { SearchByLocation } from "./by/SearchByLocation"
import { SearchByTags } from "./by/SearchByTags"
import { SearchByTerm } from "./by/SearchByTerm"
import { SearchByType } from "./by/SearchByType"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   searchBy: {
      overflowX: "auto",
      boxSizing: "border-box",
      overflowClipMargin: "106px",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
         display: "none",
      },
      px: {
         xs: "16px !important",
         sm: "16px !important",
         md: "32px !important",
      },
   },
   searchByTerm: {
      px: {
         xs: "16px !important",
         sm: "16px !important",
         md: "32px !important",
      },
   },
})

export const OverviewSearch = () => {
   return (
      <Stack sx={styles.root} spacing={2}>
         <Box sx={styles.searchByTerm}>
            <SearchByTerm />
         </Box>
         <Stack direction="row" spacing={2} sx={styles.searchBy}>
            <SearchByLocation />
            <SearchByTags />
            <SearchByType />
         </Stack>
      </Stack>
   )
}
